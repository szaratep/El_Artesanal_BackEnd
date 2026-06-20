import QuoteModel from '../models/Quote.model.js';
import UserModel  from '../models/User.model.js';

// ─── GENERATE QUOTE NUMBER ────────────────────────────────────────────────────
const _generateQuoteNumber = async () => {
    const year  = new Date().getFullYear();
    const count = await QuoteModel.countDocuments();
    const seq   = String(count + 1).padStart(5, '0');
    return `COT-${year}-${seq}`;
};

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async () => {
    return await QuoteModel.find().populate({ path: 'userId', model: 'users', select: 'name nickname email' });
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const quote = await QuoteModel
        .findById(id)
        .populate({ path: 'userId',     model: 'users', select: 'name nickname email' })

    if (!quote) throw new Error('Cotización no encontrada');
    return quote;
};

// ─── GET BY USER ───────────────────────────────────────────────────────────────
const getByUser = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    return await QuoteModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .populate({ path: 'userId',     model: 'users', select: 'name nickname email' })
};

// ─── GET BY QUOTE NUMBER ───────────────────────────────────────────────────────
const getByQuoteNumber = async (quoteNumber) => {
    const quote = await QuoteModel
        .findOne({ quoteNumber: quoteNumber.toUpperCase().trim() })
        .populate({ path: 'userId',     model: 'users', select: 'name nickname email' })

    if (!quote) throw new Error('Cotización no encontrada');
    return quote;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const user = await UserModel.findById(data.userId);
    if (!user) throw new Error('Usuario no encontrado');

    data.quoteNumber = await _generateQuoteNumber();

    const quote = new QuoteModel(data);
    return await quote.save();
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const update = async (id, data) => {
    const exists = await QuoteModel.findById(id);
    if (!exists) throw new Error('Cotización no encontrada');

    if (['Entregado', 'Cancelado'].includes(exists.status)) {
        throw new Error(`No se puede modificar una cotización con estado "${exists.status}"`);
    }

    // Prevent critical fields from being changed
    delete data.quoteNumber;
    delete data.userId;

    return await QuoteModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    )
        .populate({ path: 'userId',     model: 'users', select: 'name nickname email' });
};

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
const updateStatus = async (id, status, extraData = {}) => {
    const quote = await QuoteModel.findById(id);
    if (!quote) throw new Error('Cotización no encontrada');

    if (quote.status === 'Cancelado') {
        throw new Error('No se puede cambiar el estado de una cotización cancelada');
    }

    // Business rules per status transition
    if (status === 'Anticipo pagado') {
        if (!quote.finalPrice) throw new Error('Debe establecer el precio final antes de registrar el anticipo');
        extraData.depositPaidAt = new Date();
    }

    if (status === 'Diseño aprobado') {
        extraData.designApprovedAt = new Date();
    }

    return await QuoteModel.findByIdAndUpdate(
        id,
        { $set: { status, ...extraData } },
        { new: true, runValidators: true }
    )
        .populate({ path: 'userId',     model: 'users', select: 'name nickname email' });
};

// ─── SET FINAL PRICE ──────────────────────────────────────────────────────────
const setFinalPrice = async (id, finalPrice) => {
    const quote = await QuoteModel.findById(id);
    if (!quote) throw new Error('Cotización no encontrada');

    if (!['Pendiente de revisión', 'Cotizado'].includes(quote.status)) {
        throw new Error('El precio final solo puede establecerse cuando la cotización está en revisión o cotizada');
    }

    return await QuoteModel.findByIdAndUpdate(
        id,
        { $set: { finalPrice, status: 'Cotizado' } },
        { new: true }
    )
        .populate({ path: 'userId', model: 'users', select: 'name nickname email' });
};

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
const hardDelete = async (id) => {
    const quote = await QuoteModel.findById(id);
    if (!quote) throw new Error('Cotización no encontrada');

    if (!['Pendiente de revisión', 'Cancelado'].includes(quote.status)) {
        throw new Error('Solo se pueden eliminar cotizaciones en estado "Pendiente de revisión" o "Cancelado"');
    }

    await QuoteModel.findByIdAndDelete(id);
    return { message: 'Cotización eliminada correctamente' };
};

export default {
    getAll,
    getById,
    getByUser,
    getByQuoteNumber,
    create,
    update,
    updateStatus,
    setFinalPrice,
    hardDelete
};