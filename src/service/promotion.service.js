import PromotionModel from '../models/Promotion.model.js';
import ProductModel   from '../models/Product.model.js';
import CategoryModel  from '../models/Category.model.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async ({ page = 1, limit = 10, isActive, scope } = {}) => {
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive;
    if (scope    !== undefined) filter.scope    = scope;

    const options = {
        page:     Number(page),
        limit:    Number(limit),
        sort:     { createdAt: -1 },
        populate: [
            { path: 'applicableProducts',   model: 'products',    select: 'name sku isActive' },
            { path: 'applicableCategories', model: 'categories',  select: 'name isActive'     },
            { path: 'createdBy',            model: 'users',       select: 'name nickname'      }
        ],
        lean: false
    };

    return await PromotionModel.paginate(filter, options);
};

// ─── GET ACTIVE ───────────────────────────────────────────────────────────────
const getActive = async () => {
    const now = new Date();
    return await PromotionModel
        .find({
            isActive:  true,
            startDate: { $lte: now },
            endDate:   { $gte: now },
            $or: [
                { maxUses: null },
                { $expr: { $lt: ['$currentUses', '$maxUses'] } }
            ]
        })
        .populate({ path: 'applicableProducts',   model: 'products',   select: 'name sku' })
        .populate({ path: 'applicableCategories', model: 'categories', select: 'name'     })
        .sort({ createdAt: -1 });
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const promotion = await PromotionModel
        .findById(id)
        .populate({ path: 'applicableProducts',   model: 'products',   select: 'name sku isActive'  })
        .populate({ path: 'applicableCategories', model: 'categories', select: 'name isActive'      })
        .populate({ path: 'createdBy',            model: 'users',      select: 'name nickname'       });

    if (!promotion) throw new Error('Promoción no encontrada');
    return promotion;
};

// ─── VALIDATE APPLICABLE REFS ─────────────────────────────────────────────────
const _validateApplicableRefs = async (scope, applicableProducts = [], applicableCategories = []) => {
    if (scope === 'productos') {
        if (!applicableProducts.length) throw new Error('Debe especificar al menos un producto para el alcance "productos"');
        for (const productId of applicableProducts) {
            const product = await ProductModel.findById(productId);
            if (!product) throw new Error(`Producto con id ${productId} no encontrado`);
            if (!product.isActive) throw new Error(`El producto "${product.name}" está desactivado`);
        }
    }

    if (scope === 'categorias') {
        if (!applicableCategories.length) throw new Error('Debe especificar al menos una categoría para el alcance "categorias"');
        for (const categoryId of applicableCategories) {
            const category = await CategoryModel.findById(categoryId);
            if (!category) throw new Error(`Categoría con id ${categoryId} no encontrada`);
            if (!category.isActive) throw new Error(`La categoría "${category.name}" está desactivada`);
        }
    }
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    if (new Date(data.startDate) >= new Date(data.endDate)) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    if (data.discountType === 'Porcentaje' && (data.discountValue <= 0 || data.discountValue > 100)) {
        throw new Error('El porcentaje de descuento debe estar entre 1 y 100');
    }

    await _validateApplicableRefs(data.scope, data.applicableProducts, data.applicableCategories);

    const promotion = new PromotionModel(data);
    return await promotion.save();
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const update = async (id, data) => {
    const exists = await PromotionModel.findById(id);
    if (!exists) throw new Error('Promoción no encontrada');

    // Prevent updating usage counter directly
    delete data.currentUses;

    const startDate = data.startDate ? new Date(data.startDate) : exists.startDate;
    const endDate   = data.endDate   ? new Date(data.endDate)   : exists.endDate;
    if (startDate >= endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const discountType  = data.discountType  ?? exists.discountType;
    const discountValue = data.discountValue ?? exists.discountValue;
    if (discountType === 'Porcentaje' && (discountValue <= 0 || discountValue > 100)) {
        throw new Error('El porcentaje de descuento debe estar entre 1 y 100');
    }

    const scope                = data.scope                ?? exists.scope;
    const applicableProducts   = data.applicableProducts   ?? exists.applicableProducts;
    const applicableCategories = data.applicableCategories ?? exists.applicableCategories;
    await _validateApplicableRefs(scope, applicableProducts, applicableCategories);

    return await PromotionModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    )
        .populate({ path: 'applicableProducts',   model: 'products',   select: 'name sku isActive' })
        .populate({ path: 'applicableCategories', model: 'categories', select: 'name isActive'     })
        .populate({ path: 'createdBy',            model: 'users',      select: 'name nickname'      });
};

// ─── APPLY PROMOTION (calculate discount for an order) ────────────────────────
const applyPromotion = async (promotionId, { subtotal, productIds = [], categoryIds = [] }) => {
    const promotion = await PromotionModel.findById(promotionId);
    if (!promotion)   throw new Error('Promoción no encontrada');
    if (!promotion.isActive) throw new Error('La promoción no está activa');

    const now = new Date();
    if (now < promotion.startDate) throw new Error('La promoción aún no ha iniciado');
    if (now > promotion.endDate)   throw new Error('La promoción ha expirado');
    if (promotion.maxUses !== null && promotion.currentUses >= promotion.maxUses) {
        throw new Error('La promoción ha alcanzado su límite de usos');
    }

    // Validate scope applicability
    if (promotion.scope === 'productos') {
        const applicable = productIds.some(pid =>
            promotion.applicableProducts.some(ap => ap.toString() === pid.toString())
        );
        if (!applicable) throw new Error('La promoción no aplica a los productos de esta orden');
    }

    if (promotion.scope === 'categorias') {
        const applicable = categoryIds.some(cid =>
            promotion.applicableCategories.some(ac => ac.toString() === cid.toString())
        );
        if (!applicable) throw new Error('La promoción no aplica a las categorías de esta orden');
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'Porcentaje') {
        discountAmount = (subtotal * promotion.discountValue) / 100;
    } else {
        discountAmount = Math.min(promotion.discountValue, subtotal);
    }

    // Increment usage counter
    await PromotionModel.findByIdAndUpdate(promotionId, { $inc: { currentUses: 1 } });

    return {
        promotionId:          promotion._id,
        discountType:         promotion.discountType,
        discountValue:        promotion.discountValue,
        discountAmount:       Number(discountAmount.toFixed(2))
    };
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
const softDelete = async (id) => {
    const exists = await PromotionModel.findById(id);
    if (!exists) throw new Error('Promoción no encontrada');
    if (!exists.isActive) throw new Error('La promoción ya se encuentra desactivada');

    return await PromotionModel.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
    );
};

// ─── RESTORE ──────────────────────────────────────────────────────────────────
const restore = async (id) => {
    const exists = await PromotionModel.findById(id);
    if (!exists) throw new Error('Promoción no encontrada');
    if (exists.isActive) throw new Error('La promoción ya se encuentra activa');

    return await PromotionModel.findByIdAndUpdate(
        id,
        { $set: { isActive: true } },
        { new: true }
    );
};

export default {
    getAll,
    getActive,
    getById,
    create,
    update,
    applyPromotion,
    softDelete,
    restore
};