import quoteService from '../service/quote.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const { page, limit, userId, status } = req.query;
        const data = await quoteService.getAll({ page, limit, userId, status });

        return res.status(200).json({
            ok:      true,
            message: 'Cotizaciones obtenidas correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener las cotizaciones',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await quoteService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Cotización obtenida correctamente',
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

// ─── GET BY USER ───────────────────────────────────────────────────────────────
export const getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const data       = await quoteService.getByUser(userId);

        return res.status(200).json({
            ok:      true,
            message: 'Cotizaciones del usuario obtenidas correctamente',
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

// ─── GET BY QUOTE NUMBER ───────────────────────────────────────────────────────
export const getByQuoteNumber = async (req, res) => {
    try {
        const { quoteNumber } = req.params;
        const data            = await quoteService.getByQuoteNumber(quoteNumber);

        return res.status(200).json({
            ok:      true,
            message: 'Cotización obtenida correctamente',
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
        const data = await quoteService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Cotización creada correctamente',
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
        const data   = await quoteService.update(id, req.body);

        return res.status(200).json({
            ok:      true,
            message: 'Cotización actualizada correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrada');
        const isBusiness   = error.message.includes('No se puede modificar');
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

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
export const updateStatus = async (req, res) => {
    try {
        const { id }     = req.params;
        const { status, ...extraData } = req.body;

        if (!status) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo status es obligatorio',
                error:   'El campo status es obligatorio'
            });
        }

        const data = await quoteService.updateStatus(id, status, extraData);

        return res.status(200).json({
            ok:      true,
            message: 'Estado de la cotización actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrada');
        const isBusiness   = error.message.includes('No se puede') ||
                             error.message.includes('Debe establecer');
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

// ─── SET FINAL PRICE ──────────────────────────────────────────────────────────
export const setFinalPrice = async (req, res) => {
    try {
        const { id }          = req.params;
        const { finalPrice }  = req.body;

        if (finalPrice === undefined || finalPrice === null) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo finalPrice es obligatorio',
                error:   'El campo finalPrice es obligatorio'
            });
        }

        if (isNaN(Number(finalPrice)) || Number(finalPrice) < 0) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo finalPrice debe ser un número mayor o igual a 0',
                error:   'El campo finalPrice debe ser un número mayor o igual a 0'
            });
        }

        const data = await quoteService.setFinalPrice(id, Number(finalPrice));

        return res.status(200).json({
            ok:      true,
            message: 'Precio final establecido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        const isBusiness = error.message.includes('solo puede establecerse');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
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
        const data   = await quoteService.hardDelete(id);

        return res.status(200).json({
            ok:      true,
            message: data.message,
            data:    null
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        const isBusiness = error.message.includes('Solo se pueden eliminar');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};