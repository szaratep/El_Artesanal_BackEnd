import OrderModel     from '../models/order.model.js';
import ProductModel   from '../models/product.model.js';
import QuoteModel     from '../models/quote.model.js';
import ContactModel   from '../models/contact.model.js';
import PromotionModel from '../models/promotion.model.js';
import UserModel      from '../models/user.model.js';
import promotionService from './promotion.service.js';

// ─── GENERATE ORDER NUMBER ────────────────────────────────────────────────────
const _generateOrderNumber = async () => {
    const year  = new Date().getFullYear();
    const count = await OrderModel.countDocuments();
    const seq   = String(count + 1).padStart(5, '0');
    return `ORD-${year}-${seq}`;
};

// ─── POPULATE OPTIONS ─────────────────────────────────────────────────────────
const _populateOptions = [
    { path: 'userId',      model: 'users',      select: 'name nickname email'         },
    { path: 'contactId',   model: 'contacts',   select: 'label receiverName address phone' },
    { path: 'promotionId', model: 'promotions', select: 'name discountType discountValue'  },
    { path: 'paymentId',   model: 'payments',   select: 'status gateway paymentMethod amount' },
    { path: 'items.productId', model: 'products', select: 'name sku images unitPrice'   },
    { path: 'items.quoteId',   model: 'quotes',   select: 'quoteNumber status finalPrice' }
];

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async ({ page = 1, limit = 10, userId, status, deliveryType } = {}) => {
    const filter = {};

    if (userId       !== undefined) filter.userId       = userId;
    if (status       !== undefined) filter.status       = status;
    if (deliveryType !== undefined) filter.deliveryType = deliveryType;

    const options = {
        page:     Number(page),
        limit:    Number(limit),
        sort:     { createdAt: -1 },
        populate: _populateOptions,
        lean:     false
    };

    return await OrderModel.paginate(filter, options);
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    let order = await OrderModel.findById(id);
    if (!order) throw new Error('Orden no encontrada');

    for (const pop of _populateOptions) {
        await order.populate(pop);
    }

    return order;
};

// ─── GET BY USER ───────────────────────────────────────────────────────────────
const getByUser = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const orders = await OrderModel
        .find({ userId })
        .sort({ createdAt: -1 });

    for (const order of orders) {
        for (const pop of _populateOptions) {
            await order.populate(pop);
        }
    }

    return orders;
};

// ─── GET BY ORDER NUMBER ───────────────────────────────────────────────────────
const getByOrderNumber = async (orderNumber) => {
    let order = await OrderModel.findOne({ orderNumber: orderNumber.toUpperCase().trim() });
    if (!order) throw new Error('Orden no encontrada');

    for (const pop of _populateOptions) {
        await order.populate(pop);
    }

    return order;
};

// ─── BUILD ITEMS ──────────────────────────────────────────────────────────────
const _buildItems = async (rawItems) => {
    const items = [];

    for (const raw of rawItems) {
        if (raw.itemType === 'Producto') {
            if (!raw.productId) throw new Error('Debe especificar productId para ítems de tipo "Producto"');

            const product = await ProductModel.findById(raw.productId);
            if (!product)       throw new Error(`Producto con id ${raw.productId} no encontrado`);
            if (!product.isActive) throw new Error(`El producto "${product.name}" está desactivado`);
            if (product.stock < raw.quantity) {
                throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
            }

            const isWholesale = raw.quantity >= product.wholesaleMinQty;
            const unitPrice   = isWholesale ? product.wholesalePrice : product.unitPrice;

            items.push({
                itemType:        'Producto',
                productId:       product._id,
                quoteId:         null,
                quantity:        raw.quantity,
                unitPrice,
                priceType:       isWholesale ? 'wholesale' : 'unit',
                subtotal:        unitPrice * raw.quantity
            });

        } else if (raw.itemType === 'Perzonalizado') {
            if (!raw.quoteId) throw new Error('Debe especificar quoteId para ítems de tipo "Perzonalizado"');

            const quote = await QuoteModel.findById(raw.quoteId);
            if (!quote) throw new Error(`Cotización con id ${raw.quoteId} no encontrada`);
            if (quote.status !== 'Diseño aprobado' && quote.status !== 'Aprobado por el cliente') {
                throw new Error(`La cotización "${quote.quoteNumber}" no está en un estado válido para ser ordenada`);
            }
            if (!quote.finalPrice) throw new Error(`La cotización "${quote.quoteNumber}" no tiene precio final asignado`);

            items.push({
                itemType:  'Perzonalizado',
                productId: null,
                quoteId:   quote._id,
                quantity:  raw.quantity ?? 1,
                unitPrice: quote.finalPrice,
                priceType: 'unit',
                subtotal:  quote.finalPrice * (raw.quantity ?? 1)
            });

        } else {
            throw new Error(`Tipo de ítem no válido: ${raw.itemType}`);
        }
    }

    return items;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const user = await UserModel.findById(data.userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Validate contact if shipping
    if (data.deliveryType === 'Envío') {
        if (!data.contactId) throw new Error('Debe especificar un contacto de envío para el tipo "Envío"');
        const contact = await ContactModel.findOne({ _id: data.contactId, userId: data.userId });
        if (!contact) throw new Error('Contacto de envío no encontrado o no pertenece al usuario');
    }

    // Build and validate items
    const items    = await _buildItems(data.items);
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

    // Apply promotion if provided
    let discountAmount = 0;
    let promotionSnap  = {};

    if (data.promotionId) {
        const productIds  = items.filter(i => i.productId).map(i => i.productId);
        const products    = await ProductModel.find({ _id: { $in: productIds } });
        const categoryIds = products.map(p => p.categoryId);

        const promo = await promotionService.applyPromotion(data.promotionId, {
            subtotal,
            productIds,
            categoryIds
        });

        discountAmount = promo.discountAmount;
        promotionSnap  = {
            promotionId:           promo.promotionId,
            promotionDiscountType:  promo.discountType,
            promotionDiscountValue: promo.discountValue
        };
    }

    const shippingCost  = data.shippingCost ?? 0;
    const totalAmount   = subtotal - discountAmount + shippingCost;
    const orderNumber   = await _generateOrderNumber();

    const order = new OrderModel({
        orderNumber,
        userId:        data.userId,
        status:        'Pendiente de pago',
        items,
        subtotal,
        discountAmount,
        shippingCost,
        totalAmount,
        deliveryType:  data.deliveryType,
        contactId:     data.deliveryType === 'Envío' ? data.contactId : null,
        adminNotes:    data.adminNotes ?? '',
        ...promotionSnap
    });

    const saved = await order.save();

    // Decrement stock for standard products
    for (const item of items) {
        if (item.itemType === 'Producto') {
            await ProductModel.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }
    }

    return saved;
};

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
const updateStatus = async (id, status, extraData = {}) => {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Orden no encontrada');

    if (['Entregado', 'Cancelado', 'Reembolsado'].includes(order.status)) {
        throw new Error(`No se puede cambiar el estado de una orden con estado "${order.status}"`);
    }

    return await OrderModel.findByIdAndUpdate(
        id,
        { $set: { status, ...extraData } },
        { new: true, runValidators: true }
    );
};

// ─── UPDATE TRACKING ──────────────────────────────────────────────────────────
const updateTracking = async (id, { trackingNumber, trackingCompany }) => {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Orden no encontrada');
    if (order.deliveryType !== 'Envío') throw new Error('Solo las órdenes con envío tienen número de guía');

    return await OrderModel.findByIdAndUpdate(
        id,
        { $set: { trackingNumber, trackingCompany } },
        { new: true }
    );
};

// ─── SET PAYMENT ──────────────────────────────────────────────────────────────
const setPayment = async (id, paymentId) => {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Orden no encontrada');

    return await OrderModel.findByIdAndUpdate(
        id,
        { $set: { paymentId } },
        { new: true }
    );
};

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
const hardDelete = async (id) => {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Orden no encontrada');

    if (!['Pendiente de pago', 'Cancelado'].includes(order.status)) {
        throw new Error('Solo se pueden eliminar órdenes con estado "Pendiente de pago" o "Cancelado"');
    }

    await OrderModel.findByIdAndDelete(id);
    return { message: 'Orden eliminada correctamente' };
};

export default {
    getAll,
    getById,
    getByUser,
    getByOrderNumber,
    create,
    updateStatus,
    updateTracking,
    setPayment,
    hardDelete
};