import orderService from '../service/order.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const { page, limit, userId, status, deliveryType } = req.query;
        const data = await orderService.getAll({ page, limit, userId, status, deliveryType });

        return res.status(200).json({
            ok:      true,
            message: 'Órdenes obtenidas correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener las órdenes',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await orderService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Orden obtenida correctamente',
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
        const data       = await orderService.getByUser(userId);

        return res.status(200).json({
            ok:      true,
            message: 'Órdenes del usuario obtenidas correctamente',
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

// ─── GET BY ORDER NUMBER ───────────────────────────────────────────────────────
export const getByOrderNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const data            = await orderService.getByOrderNumber(orderNumber);

        return res.status(200).json({
            ok:      true,
            message: 'Orden obtenida correctamente',
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
        const data = await orderService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Orden creada correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrado') ||
                             error.message.includes('no encontrada');
        const isBusiness   = error.message.includes('Stock insuficiente')       ||
                             error.message.includes('desactivado')               ||
                             error.message.includes('estado válido')             ||
                             error.message.includes('precio final')              ||
                             error.message.includes('no pertenece al usuario')   ||
                             error.message.includes('Debe especificar');
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
        const { id }               = req.params;
        const { status, ...extra } = req.body;

        if (!status) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo status es obligatorio',
                error:   'El campo status es obligatorio'
            });
        }

        const data = await orderService.updateStatus(id, status, extra);

        return res.status(200).json({
            ok:      true,
            message: 'Estado de la orden actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrada');
        const isBusiness   = error.message.includes('No se puede cambiar');
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

// ─── UPDATE TRACKING ──────────────────────────────────────────────────────────
export const updateTracking = async (req, res) => {
    try {
        const { id }                              = req.params;
        const { trackingNumber, trackingCompany } = req.body;

        if (!trackingNumber || !trackingCompany) {
            return res.status(400).json({
                ok:      false,
                message: 'Los campos trackingNumber y trackingCompany son obligatorios',
                error:   'Los campos trackingNumber y trackingCompany son obligatorios'
            });
        }

        const data = await orderService.updateTracking(id, { trackingNumber, trackingCompany });

        return res.status(200).json({
            ok:      true,
            message: 'Información de seguimiento actualizada correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrada');
        const isBusiness = error.message.includes('Solo las órdenes con envío');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── SET PAYMENT ──────────────────────────────────────────────────────────────
export const setPayment = async (req, res) => {
    try {
        const { id }        = req.params;
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo paymentId es obligatorio',
                error:   'El campo paymentId es obligatorio'
            });
        }

        const data = await orderService.setPayment(id, paymentId);

        return res.status(200).json({
            ok:      true,
            message: 'Pago vinculado a la orden correctamente',
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

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
export const hardDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await orderService.hardDelete(id);

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