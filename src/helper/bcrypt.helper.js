import { genSaltSync, hashSync, compareSync } from 'bcrypt';
 
const encryptedPassword = (orinalPassword) => {
    try {
        // Paso 1: Generar una cadena aleatorea (salt)
        const salt = genSaltSync(5);
        // Paso 2: Encriptar la contraseña
        const hasPassword = hashSync(orinalPassword, salt);
 
        //Paso 3: Retornar password encriptado listo para registrar
        return hasPassword;
    } catch (error) {
        console.error(error);
        return null;
    }
}
 
const validatePassword = (originalPassword, hasPassword) => {
    try {
        //Valida la contraseña     (1235322223155asd, Viene de la base de datos)
        const isValid = compareSync(originalPassword, hasPassword);
        // Retornamos el resultado de la compratacion (True / False)
        return isValid
    } catch (error) {
        console.log(error);
        return null;
    }
}
 
export {
    encryptedPassword,
    validatePassword
};