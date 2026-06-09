import promotionService from '../service/promotion.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const { page, limit, isActive, scope } = req.query;
        const data = await promotionService.getAll({ page, limit, isActive, scope });

        return res.status(200).json({
            ok:      true,
            message: 'Promociones obtenidas correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener las promociones',
            error:   error.message
        });
    }
};

// ─── GET ACTIVE ───────────────────────────────────────────────────────────────
export const getActive = async (req, res) => {
    try {
        const data = await promotionService.getActive();

        return res.status(200).json({
            ok:      true,
            message: 'Promociones activas obtenidas correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener las promociones activas',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await promotionService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Promoción obtenida correctamente',
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
        const data = await promotionService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Promoción creada correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrad');
        const isBusiness   = error.message.includes('debe ser anterior') ||
                             error.message.includes('debe estar entre') ||
                             error.message.includes('Debe especificar') ||
                             error.message.includes('desactivad');
        const isValidation = error.name === 'ValidationError';

        return res.status(
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
        const data   = await promotionService.update(id, req.body);

        return res.status(200).json({
            ok:      true,
            message: 'Promoción actualizada correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrad');
        const isBusiness   = error.message.includes('debe ser anterior') ||
                             error.message.includes('debe estar entre') ||
                             error.message.includes('Debe especificar') ||
                             error.message.includes('desactivad');
        const isValidation = error.name === 'ValidationError';

        return res.status(
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

// ─── APPLY PROMOTION ──────────────────────────────────────────────────────────
export const applyPromotion = async (req, res) => {
    try {
        const { id }                                    = req.params;
        const { subtotal, productIds, categoryIds } = req.body;

        if (subtotal === undefined || subtotal === null) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo subtotal es obligatorio',
                error:   'El campo subtotal es obligatorio'
            });
        }

        if (isNaN(Number(subtotal)) || Number(subtotal) < 0) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo subtotal debe ser un número mayor o igual a 0',
                error:   'El campo subtotal debe ser un número mayor o igual a 0'
            });
        }

        const data = await promotionService.applyPromotion(id, {
            subtotal:    Number(subtotal),
            productIds:  productIds  ?? [],
            categoryIds: categoryIds ?? []
        });

        return res.status(200).json({
            ok:      true,
            message: 'Promoción aplicada correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        const isBusiness = error.message.includes('no está activa')    ||
                           error.message.includes('aún no ha iniciado') ||
                           error.message.includes('ha expirado')        ||
                           error.message.includes('límite de usos')     ||
                           error.message.includes('no aplica');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
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
        const data   = await promotionService.softDelete(id);

        return res.status(200).json({
            ok:      true,
            message: 'Promoción desactivada correctamente',
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

// ─── RESTORE ──────────────────────────────────────────────────────────────────
export const restore = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await promotionService.restore(id);

        return res.status(200).json({
            ok:      true,
            message: 'Promoción restaurada correctamente',
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