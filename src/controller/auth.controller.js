import { validatePassword } from "../helper/bcrypt.helper.js";
import { generateToken } from "../helper/jwt.helper.js";
import verifyEmailOrNickname from "../helper/verifyEmailOrNickname.helper.js";
import user_service from "../service/user.service.js";


const loginUser = async (req, res) => {
    try {
        // Paso 1: Extraer los datos del cuerpo de la peticion;
        const inputData = req.body; //{user: 'email o nickname', password: ''}

        if (!inputData.password) {
            throw new Error('Se olvido pasar la propiedad password en el login');
        }

        if (!inputData.user) {
            throw new Error('Se olvido pasar la propiedad user en el login');
        }

        // Paso 2: Verificar si el usuario existe y Verifica si se va a buscar por correo o por nickname
        const userFound = await verifyEmailOrNickname(inputData);

        if (!userFound) {
            throw new Error('El usuario no existe, por favor registrese');
        }

        if (!userFound.status) {
            throw new Error('El usuario se encuentra desactivado');
        }

        // Paso 3: Verificar si la contraseña es valida
        const isValid = validatePassword(inputData.password, userFound.password)

        if (!isValid) {
            throw new Error('Sus credenciales no son validas');
        }

        // Paso 4: Generar el token
        const payload = {
            _id: userFound._id,
            name: userFound.name,
            nickname: userFound.nickname,
            email: userFound.email,
            role: userFound.role,
            avatar: userFound.avatar,
            status: userFound.status
        };

        const token = generateToken(payload);

        if (token === null) {
            throw new Error('No se pudo generar el token de acceso');
        }

        // Paso 5: Convertir un BJSON en JSON para eliminar la propiedad password
        const userFoundObj = userFound.toObject();

        delete userFoundObj.password;
        delete userFoundObj.createdAt;
        delete userFoundObj.updatedAt;

        //Paso 6: Responde al cliente enviandole el token;
        res.json({
            msg: 'login exitoso',
            token,
            data: userFoundObj
        });

    } catch (error) {
        console.error(error);

        // A. Controlar errores de validación de campos del login (Negocio)
        if (
            error.message.includes('Se olvido pasar') ||
            error.message.includes('El usuario no existe') ||
            error.message.includes('Sus credenciales no son validas') ||
            error.message.includes('desactivado')
        ) {
            return res.status(400).json({
                msg: error.message
            });
        }

        // B. Controlar error al generar el token (Internal Server Error)
        if (error.message.includes('No se pudo generar el token de acceso')) {
            return res.status(500).json({
                msg: error.message
            });
        }

        // C. Error general interno del servidor (p. ej. error en la base de datos o de sintaxis)
        res.status(500).json({
            msg: 'Ocurrió un error en el servidor durante el login'
        });
    }
}

const reNewToken = async (req, res) => {
    // Paso 1: obtener los datos del usuario y carga util del middleware
    const payload = req.payload;
    const user = req.user;

    // Paso2: Verificar que el usuario al que se le va a generar el nuevo token exista y este activo
    const userFound = await user_service.getByEmail(payload.email);

    if (!userFound || !userFound.status) {
        return res.status(400).json({
            msg: 'No se renueva el token, por que el usuario ha sido eliminado o su estado es inactivo'
        });
    }

    // Paso 3; Generar un nuevo token a partir de los datos registrados en la base de datos
    const newPayload = {
        _id: userFound._id,
        name: userFound.name,
        nickname: userFound.nickname,
        email: userFound.email,
        role: userFound.role,
        avatar: userFound.avatar,
        status: userFound.status
    };

    // Creacion del nuevo token
    const token = generateToken(newPayload);

    // Paso 4: Eliminar las propiedades sensibles como el password, etc.
    const userFoundObj = userFound.toObject();

    delete userFoundObj.password;
    delete userFoundObj.createdAt;
    delete userFoundObj.updatedAt;

    // Paso 5: Responde al cliente con el nuevo token y los datos del usuario
    res.json({
        msg: 'Renovacion exitosa',
        token,
        data: userFoundObj
    });

}

export {
    loginUser,
    reNewToken
}