const authorizationUser = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            // Paso 1: Extrae el rol del req.payload
            const { role } = req.payload;   //Desestructuracion (ES2015)
            // Verifica si hay un valor en role
            if (!role) {
                // Nosotros definimos manualmente una excepcion
                throw new Error('No tiene los permisos definidos');
            }
            // Paso 2: verificar si el rol del usuario esta en la lista de roles permitidos
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    msg: `El rol ${role} no esta autorizado para esta accion`
                })
            }
            // Paso 3: Da acceso a la ejecucion de la siguiente funcion en la ruta
            next();
        } catch (error) {
            console.error(error);
            if (error.message.includes('No tiene los permisos')) {
                return res.status(404).json({
                    msg: error.message
                })
            }
            // Respuesta generica de la excepcion
            res.status(500).json({
                msg: 'Error de autorizacion del servidor'
            });
        }
    }
}

export default authorizationUser;