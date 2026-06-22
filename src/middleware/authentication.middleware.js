import { verifyToken } from "../helper/jwt.helper.js";
import user_service from "../service/user.service.js";

const authenticationUser = async (req, res, next) => {
    // Paso 1: obtengo la cadena que contiene en Token
    const token = req.header('X-Token');
    if (!token) {
        return res.status(401).json({
            msg: 'Cadena de token vacia'
        });
    }
    // Paso 2; verificar "formato" del token
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return res.status(400).json({
            msg: 'Formato del token invalido'
        })
    }
    // Paso 3: verifica la autenticidad del token y estrae el payload
    const payload = verifyToken(token)
    if (!payload) {
        return res.status(400).json({
            msg: 'token invalido o inactivo'
        });
    }
    // Paso 4: verifica si el usuario dentro del payload existe y sigue activo
    const userFound = await user_service.getByEmail(payload.email);
    if (!userFound) {
        return res.status(400).json({
            msg: 'No es posible generar el nuevo Token'
        });
    }
    if (!userFound.status) {
        return res.status(403).json({
            msg: 'El usuario se encuentra desactivado'
        });
    }
    // Paso 5: elimina las propiedades innecesarias para crear el nuevo payload
    const userFoundObj = userFound.toObject();
    delete userFoundObj.password;
    delete userFoundObj.createdAt;
    delete userFoundObj.updatedAt;
    // Paso 6: creo las propiedades que almacenaran los datos que quiero pasar a la siguiente funcion (que pueden ser: otro middleware o el controlador)
    req.payload = userFoundObj;
    req.user = userFound;
    // Paso 7: la autorizacion para ejecutar la siguiente funcion (que pueden ser: otro middleware o el controlador)
    next();
}

export default authenticationUser;