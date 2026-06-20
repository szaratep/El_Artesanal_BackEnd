import PaymentModel from '../models/Payment.model.js';
import OrderModel   from '../models/Order.model.js';
import UserModel    from '../models/User.model.js';

// ─── POPULATE OPTIONS ─────────────────────────────────────────────────────────
const _populateOptions = [
    { path: 'orderId', model: 'orders', select: 'orderNumber status totalAmount deliveryType' },
    { path: 'userId',  model: 'users',  select: 'name nickname email'                         }
];

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async () => {
    return await PaymentModel.find()
        .populate(_populateOptions[0])
        .populate(_populateOptions[1]);
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const payment = await PaymentModel
        .findById(id)
        .populate(_populateOptions[0])
        .populate(_populateOptions[1]);

    if (!payment) throw new Error('Pago no encontrado');
    return payment;
};

// ─── GET BY ORDER ─────────────────────────────────────────────────────────────
const getByOrder = async (orderId) => {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Orden no encontrada');

    const payment = await PaymentModel
        .findOne({ orderId })
        .populate(_populateOptions[0])
        .populate(_populateOptions[1]);

    if (!payment) throw new Error('No se encontró un pago asociado a esta orden');
    return payment;
};

// ─── GET BY GATEWAY TRANSACTION ID ────────────────────────────────────────────
const getByGatewayTransactionId = async (gatewayTransactionId) => {
    const payment = await PaymentModel
        .findOne({ gatewayTransactionId: gatewayTransactionId.trim() })
        .populate(_populateOptions[0])
        .populate(_populateOptions[1]);

    if (!payment) throw new Error('Transacción no encontrada');
    return payment;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const order = await OrderModel.findById(data.orderId);
    if (!order) throw new Error('Orden no encontrada');
    if (!['Pendiente de pago', 'Pago en procesamiento'].includes(order.status)) {
        throw new Error(`La orden tiene estado "${order.status}" y no puede recibir un nuevo pago`);
    }

    const user = await UserModel.findById(data.userId);
    if (!user) throw new Error('Usuario no encontrado');

    const existingPayment = await PaymentModel.findOne({ orderId: data.orderId });
    if (existingPayment) throw new Error('Ya existe un pago registrado para esta orden');

    if (data.amount !== order.totalAmount) {
        throw new Error(`El monto del pago (${data.amount}) no coincide con el total de la orden (${order.totalAmount})`);
    }

    const payment = new PaymentModel(data);
    const saved   = await payment.save();

    // Link payment to order and update order status
    await OrderModel.findByIdAndUpdate(
        data.orderId,
        { $set: { paymentId: saved._id, status: 'Pago en procesamiento' } }
    );

    return saved;
};

// ─── UPDATE STATUS (webhook / gateway callback) ───────────────────────────────
const updateStatus = async (id, { status, gatewayResponse, failureReason }) => {
    const payment = await PaymentModel.findById(id);
    if (!payment) throw new Error('Pago no encontrado');

    if (['Reembolsado', 'Anulado'].includes(payment.status)) {
        throw new Error(`No se puede actualizar un pago con estado "${payment.status}"`);
    }

    const updateData = { status };
    if (gatewayResponse) updateData.gatewayResponse = gatewayResponse;
    if (failureReason)   updateData.failureReason   = failureReason;
    if (status === 'Aprobado') updateData.paidAt = new Date();

    const updated = await PaymentModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );

    // Sync order status based on payment result
    const orderStatusMap = {
        'Aprobado':         'Pagado',
        'Rechazado':        'Pendiente de pago',
        'Fallido':          'Pendiente de pago',
        'Anulado':          'Cancelado',
        'En procesamiento': 'Pago en procesamiento'
    };

    if (orderStatusMap[status]) {
        await OrderModel.findByIdAndUpdate(
            payment.orderId,
            { $set: { status: orderStatusMap[status] } }
        );
    }

    return updated;
};

// ─── PROCESS REFUND ───────────────────────────────────────────────────────────
const processRefund = async (id, refundAmount) => {
    const payment = await PaymentModel.findById(id);
    if (!payment) throw new Error('Pago no encontrado');
    if (payment.status !== 'Aprobado') throw new Error('Solo se pueden reembolsar pagos aprobados');

    if (refundAmount > payment.amount) {
        throw new Error(`El monto del reembolso (${refundAmount}) no puede superar el monto pagado (${payment.amount})`);
    }

    const updated = await PaymentModel.findByIdAndUpdate(
        id,
        { $set: { status: 'Reembolsado', refundAmount, refundedAt: new Date() } },
        { new: true }
    );

    await OrderModel.findByIdAndUpdate(
        payment.orderId,
        { $set: { status: 'Reembolsado' } }
    );

    return updated;
};

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
const hardDelete = async (id) => {
    const payment = await PaymentModel.findById(id);
    if (!payment) throw new Error('Pago no encontrado');

    if (!['Pendiente', 'Fallido', 'Rechazado'].includes(payment.status)) {
        throw new Error('Solo se pueden eliminar pagos con estado "Pendiente", "Fallido" o "Rechazado"');
    }

    // Unlink from order
    await OrderModel.findByIdAndUpdate(
        payment.orderId,
        { $set: { paymentId: null, status: 'Pendiente de pago' } }
    );

    await PaymentModel.findByIdAndDelete(id);
    return { message: 'Pago eliminado correctamente' };
};

export default {
    getAll,
    getById,
    getByOrder,
    getByGatewayTransactionId,
    create,
    updateStatus,
    processRefund,
    hardDelete
};