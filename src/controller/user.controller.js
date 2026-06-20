import userService from '../service/user.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const data = await userService.getAll();

        return res.status(200).json({
            ok:      true,
            message: 'Usuarios obtenidos correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener los usuarios',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await userService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Usuario obtenido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── GET BY EMAIL ──────────────────────────────────────────────────────────────
export const getByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const data      = await userService.getByEmail(email);

        return res.status(200).json({
            ok:      true,
            message: 'Usuario obtenido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── GET BY NICKNAME ───────────────────────────────────────────────────────────
export const getByNickname = async (req, res) => {
    try {
        const { nickname } = req.params;
        const data         = await userService.getByNickname(nickname);

        return res.status(200).json({
            ok:      true,
            message: 'Usuario obtenido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
export const create = async (req, res) => {
    try {
        const data = await userService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Usuario creado correctamente',
            data
        });
    } catch (error) {
        const isConflict   = error.message.includes('ya está registrado') ||
                             error.message.includes('ya está en uso');
        const isValidation = error.name === 'ValidationError';

        return res.status(isConflict ? 409 : isValidation ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await userService.update(id, req.body);

        return res.status(200).json({
            ok:      true,
            message: 'Usuario actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrado');
        const isConflict   = error.message.includes('ya está registrado') ||
                             error.message.includes('ya está en uso');
        const isValidation = error.name === 'ValidationError';

        return res.status(isNotFound ? 404 : isConflict ? 409 : isValidation ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── UPDATE ROLE ───────────────────────────────────────────────────────────────
export const updateRole = async (req, res) => {
    try {
        const { id }   = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo role es obligatorio',
                error:   'El campo role es obligatorio'
            });
        }

        const data = await userService.updateRole(id, role);

        return res.status(200).json({
            ok:      true,
            message: 'Rol actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrado');
        const isValidation = error.name === 'ValidationError';

        return res.status(isNotFound ? 404 : isValidation ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── UPDATE PASSWORD ───────────────────────────────────────────────────────────
export const updatePassword = async (req, res) => {
    try {
        const { id }             = req.params;
        const { hashedPassword } = req.body;

        if (!hashedPassword) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo hashedPassword es obligatorio',
                error:   'El campo hashedPassword es obligatorio'
            });
        }

        const data = await userService.updatePassword(id, hashedPassword);

        return res.status(200).json({
            ok:      true,
            message: 'Contraseña actualizada correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
export const softDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await userService.softDelete(id);

        return res.status(200).json({
            ok:      true,
            message: 'Usuario desactivado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isConflict = error.message.includes('ya se encuentra');
        console.error(error)

        return res.status(isNotFound ? 404 : isConflict ? 409 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── RESTORE ──────────────────────────────────────────────────────────────────
export const restore = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await userService.restore(id);

        return res.status(200).json({
            ok:      true,
            message: 'Usuario restaurado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isConflict = error.message.includes('ya se encuentra');

        return res.status(isNotFound ? 404 : isConflict ? 409 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── ADD CONTACT ──────────────────────────────────────────────────────────────
export const addContact = async (req, res) => {
    try {
        const { id }        = req.params;
        const { contactId } = req.body;

        if (!contactId) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo contactId es obligatorio',
                error:   'El campo contactId es obligatorio'
            });
        }

        const data = await userService.addContact(id, contactId);

        return res.status(200).json({
            ok:      true,
            message: 'Contacto vinculado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isConflict = error.message.includes('ya está vinculado');

        return res.status(isNotFound ? 404 : isConflict ? 409 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── REMOVE CONTACT ───────────────────────────────────────────────────────────
export const removeContact = async (req, res) => {
    try {
        const { id, contactId } = req.params;
        const data              = await userService.removeContact(id, contactId);

        return res.status(200).json({
            ok:      true,
            message: 'Contacto desvinculado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isConflict = error.message.includes('no está vinculado');

        return res.status(isNotFound ? 404 : isConflict ? 409 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};