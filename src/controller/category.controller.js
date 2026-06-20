import categoryService from '../service/category.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const data = await categoryService.getAll();

        return res.status(200).json({
            ok:      true,
            message: 'Categorías obtenidas correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener las categorías',
            error:   error.message
        });
    }
};

// ─── GET ALL ROOT ─────────────────────────────────────────────────────────────
export const getAllRoot = async (req, res) => {
    try {
        const data = await categoryService.getAllRoot();

        return res.status(200).json({
            ok:      true,
            message: 'Categorías raíz obtenidas correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener las categorías raíz',
            error:   error.message
        });
    }
};

// ─── GET SUBCATEGORIES ────────────────────────────────────────────────────────
export const getSubcategories = async (req, res) => {
    try {
        const { parentId } = req.params;
        const data         = await categoryService.getSubcategories(parentId);

        return res.status(200).json({
            ok:      true,
            message: 'Subcategorías obtenidas correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await categoryService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Categoría obtenida correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
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
        const data = await categoryService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Categoría creada correctamente',
            data
        });
    } catch (error) {
        const isConflict   = error.message.includes('Ya existe');
        const isNotFound   = error.message.includes('no existe') ||
                             error.message.includes('no encontrada');
        const isBusiness   = error.message.includes('desactivada');
        const isValidation = error.name === 'ValidationError';

        return res.status(
            isConflict   ? 409 :
            isNotFound   ? 404 :
            isBusiness   ? 422 :
            isValidation ? 422 : 500
        ).json({
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
        const data   = await categoryService.update(id, req.body);

        return res.status(200).json({
            ok:      true,
            message: 'Categoría actualizada correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrada') ||
                             error.message.includes('no existe');
        const isConflict   = error.message.includes('Ya existe');
        const isBusiness   = error.message.includes('no puede ser') ||
                             error.message.includes('desactivada');
        const isValidation = error.name === 'ValidationError';

        return res.status(
            isNotFound   ? 404 :
            isConflict   ? 409 :
            isBusiness   ? 422 :
            isValidation ? 422 : 500
        ).json({
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
        const data   = await categoryService.softDelete(id);

        return res.status(200).json({
            ok:      true,
            message: 'Categoría desactivada correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        const isConflict = error.message.includes('ya se encuentra');
        const isBusiness = error.message.includes('producto(s) activo(s)');

        return res.status(isNotFound ? 404 : isConflict ? 409 : isBusiness ? 422 : 500).json({
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
        const data   = await categoryService.restore(id);

        return res.status(200).json({
            ok:      true,
            message: 'Categoría restaurada correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        const isConflict = error.message.includes('ya se encuentra');

        return res.status(isNotFound ? 404 : isConflict ? 409 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};