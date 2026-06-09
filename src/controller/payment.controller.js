import paymentService from '../service/payment.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const { page, limit, userId, status, gateway, paymentMethod } = req.query;
        const data = await paymentService.getAll({ page, limit, userId, status, gateway, paymentMethod });

        return res.status(200).json({
            ok:      true,
            message: 'Pagos obtenidos correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener los pagos',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await paymentService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Pago obtenido correctamente',
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

// ─── GET BY ORDER ─────────────────────────────────────────────────────────────
export const getByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const data        = await paymentService.getByOrder(orderId);

        return res.status(200).json({
            ok:      true,
            message: 'Pago de la orden obtenido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrad');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── GET BY GATEWAY TRANSACTION ID ────────────────────────────────────────────
export const getByGatewayTransactionId = async (req, res) => {
    try {
        const { gatewayTransactionId } = req.params;
        const data = await paymentService.getByGatewayTransactionId(gatewayTransactionId);

        return res.status(200).json({
            ok:      true,
            message: 'Transacción obtenida correctamente',
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
        const data = await paymentService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Pago registrado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrad');
        const isConflict   = error.message.includes('Ya existe un pago');
        const isBusiness   = error.message.includes('no coincide')  ||
                             error.message.includes('no puede recibir');
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

// ─── UPDATE STATUS (webhook) ──────────────────────────────────────────────────
export const updateStatus = async (req, res) => {
    try {
        const { id }                                      = req.params;
        const { status, gatewayResponse, failureReason } = req.body;

        if (!status) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo status es obligatorio',
                error:   'El campo status es obligatorio'
            });
        }

        const data = await paymentService.updateStatus(id, { status, gatewayResponse, failureReason });

        return res.status(200).json({
            ok:      true,
            message: 'Estado del pago actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrado');
        const isBusiness   = error.message.includes('No se puede actualizar');
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

// ─── PROCESS REFUND ───────────────────────────────────────────────────────────
export const processRefund = async (req, res) => {
    try {
        const { id }           = req.params;
        const { refundAmount } = req.body;

        if (refundAmount === undefined || refundAmount === null) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo refundAmount es obligatorio',
                error:   'El campo refundAmount es obligatorio'
            });
        }

        if (isNaN(Number(refundAmount)) || Number(refundAmount) <= 0) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo refundAmount debe ser un número mayor a 0',
                error:   'El campo refundAmount debe ser un número mayor a 0'
            });
        }

        const data = await paymentService.processRefund(id, Number(refundAmount));

        return res.status(200).json({
            ok:      true,
            message: 'Reembolso procesado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isBusiness = error.message.includes('Solo se pueden reembolsar') ||
                           error.message.includes('no puede superar');

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
        const data   = await paymentService.hardDelete(id);

        return res.status(200).json({
            ok:      true,
            message: data.message,
            data:    null
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isBusiness = error.message.includes('Solo se pueden eliminar');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};