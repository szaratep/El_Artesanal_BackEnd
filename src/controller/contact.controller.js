import contactService from '../service/contact.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const data = await contactService.getAll();

        return res.status(200).json({
            ok:      true,
            message: 'Contactos obtenidos correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener los contactos',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await contactService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Contacto obtenido correctamente',
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

// ─── GET BY USER ───────────────────────────────────────────────────────────────
export const getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const data       = await contactService.getByUser(userId);

        return res.status(200).json({
            ok:      true,
            message: 'Contactos del usuario obtenidos correctamente',
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
        const data = await contactService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Contacto creado correctamente',
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

// ─── UPDATE ────────────────────────────────────────────────────────────────────
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await contactService.update(id, req.body);

        return res.status(200).json({
            ok:      true,
            message: 'Contacto actualizado correctamente',
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

// ─── SET DEFAULT ──────────────────────────────────────────────────────────────
export const setDefault = async (req, res) => {
    try {
        const { id }     = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo userId es obligatorio',
                error:   'El campo userId es obligatorio'
            });
        }

        const data = await contactService.setDefault(id, userId);

        return res.status(200).json({
            ok:      true,
            message: 'Contacto predeterminado actualizado correctamente',
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

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
export const hardDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await contactService.hardDelete(id);

        return res.status(200).json({
            ok:      true,
            message: data.message,
            data:    null
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