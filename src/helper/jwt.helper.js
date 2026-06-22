import jwt from 'jsonwebtoken';

const generateToken = (payload) => {
    try {
        //                    (Carga util, semilla / palabra clave, configuraciones adicionales: tiempo de caducidad)
        const token = jwt.sign(payload, process.env.JWT_SEED, { expiresIn: '1h' });
        return token;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const verifyToken = (token) => {
    try {
        //                        (Token, semilla / palabra clave)
        const payload = jwt.verify(token, process.env.JWT_SEED);
        return payload;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export {
    generateToken,
    verifyToken
}