import { ROLES } from "../config/global.config.js";

const verifyOwnResource = (req, res, next) => {
    try {
        // Paso 1: Extraer el id del usuario autenticado desde el payload
        const { _id, role } = req.payload;

        // Paso 2: Extraer el id del recurso que se quiere modificar desde los params
        const { id } = req.params;

        // Paso 3: Si es administrator, puede modificar cualquier recurso
        if (role === ROLES.ADMIN) {
            return next();
        }

        // Paso 4: Verificar que el usuario autenticado sea el dueño del recurso
        if (_id.toString() !== id.toString()) {
            return res.status(403).json({
                msg: 'No tienes permisos para modificar el recurso de otro usuario'
            });
        }

        // Paso 5: Es el dueño, puede continuar
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al verificar el recurso'
        });
    }
}

export default verifyOwnResource;