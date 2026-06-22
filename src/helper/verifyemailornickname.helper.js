import user_service from "../service/user.service.js";


const verifyEmailOrNickname = async (inputData) => {
    try {
        // Paso 1: Detectar si el dato enviado es un correo o un nickname
        const isEmail = inputData.user.includes('@');

        // Paso 2: Buscar el usuario segun corresponda
        const userFound = isEmail
            ? await user_service.getByEmail(inputData.user)
            : await user_service.getByNickname(inputData.user);

        // Paso 3: Retornar el usuario encontrado (o null si no existe)
        return userFound;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default verifyEmailOrNickname;