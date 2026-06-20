import ProductModel  from '../models/Product.model.js';
import CategoryModel from '../models/Category.model.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async () => {
    return await ProductModel.find({ isActive: true }).populate({ path: 'categoryId', model: 'categories', select: 'name isActive' });
};

// ─── GET FEATURED ─────────────────────────────────────────────────────────────
const getFeatured = async () => {
    return await ProductModel
        .find({ isFeatured: true, isActive: true })
        .sort({ createdAt: -1 })
        .populate({ path: 'categoryId', model: 'categories', select: 'name' });
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const product = await ProductModel
        .findById(id)
        .populate({ path: 'categoryId', model: 'categories', select: 'name isActive' });

    if (!product) throw new Error('Producto no encontrado');
    return product;
};

// ─── GET BY SKU ────────────────────────────────────────────────────────────────
const getBySku = async (sku) => {
    const product = await ProductModel
        .findOne({ sku: sku.toUpperCase().trim() })
        .populate({ path: 'categoryId', model: 'categories', select: 'name isActive' });

    if (!product) throw new Error('Producto no encontrado');
    return product;
};

// ─── RESOLVE PRICE (wholesale vs unit) ────────────────────────────────────────
const resolvePrice = (product, quantity) => {
    const isWholesale = quantity >= product.wholesaleMinQty;
    return {
        unitPrice: isWholesale ? product.wholesalePrice : product.unitPrice,
        priceType: isWholesale ? 'wholesale' : 'unit',
        subtotal:  (isWholesale ? product.wholesalePrice : product.unitPrice) * quantity
    };
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const skuExists = await ProductModel.findOne({ sku: data.sku?.toUpperCase().trim() });
    if (skuExists) throw new Error('Ya existe un producto con ese SKU');

    const category = await CategoryModel.findById(data.categoryId);
    if (!category) throw new Error('La categoría no existe');
    if (!category.isActive) throw new Error('La categoría se encuentra desactivada');

    if (data.wholesalePrice >= data.unitPrice) {
        throw new Error('El precio al por mayor debe ser menor que el precio unitario');
    }

    const product = new ProductModel(data);
    return await product.save();
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const update = async (id, data) => {
    const exists = await ProductModel.findById(id);
    if (!exists) throw new Error('Producto no encontrado');

    if (data.sku) {
        const skuTaken = await ProductModel.findOne({
            sku: data.sku.toUpperCase().trim(),
            _id: { $ne: id }
        });
        if (skuTaken) throw new Error('Ya existe un producto con ese SKU');
    }

    if (data.categoryId) {
        const category = await CategoryModel.findById(data.categoryId);
        if (!category) throw new Error('La categoría no existe');
        if (!category.isActive) throw new Error('La categoría se encuentra desactivada');
    }

    const unitPrice      = data.unitPrice      ?? exists.unitPrice;
    const wholesalePrice = data.wholesalePrice ?? exists.wholesalePrice;
    if (wholesalePrice >= unitPrice) {
        throw new Error('El precio al por mayor debe ser menor que el precio unitario');
    }

    return await ProductModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).populate({ path: 'categoryId', model: 'categories', select: 'name isActive' });
};

// ─── UPDATE STOCK ─────────────────────────────────────────────────────────────
const updateStock = async (id, quantity) => {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Producto no encontrado');

    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error('El stock no puede quedar en negativo');

    return await ProductModel.findByIdAndUpdate(
        id,
        { $set: { stock: newStock } },
        { new: true }
    );
};

// ─── TOGGLE FEATURED ──────────────────────────────────────────────────────────
const toggleFeatured = async (id) => {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    if (!product.isActive) throw new Error('No se puede destacar un producto desactivado');

    return await ProductModel.findByIdAndUpdate(
        id,
        { $set: { isFeatured: !product.isFeatured } },
        { new: true }
    );
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
const softDelete = async (id) => {
    const exists = await ProductModel.findById(id);
    if (!exists) throw new Error('Producto no encontrado');
    if (!exists.isActive) throw new Error('El producto ya se encuentra desactivado');

    return await ProductModel.findByIdAndUpdate(
        id,
        { $set: { isActive: false, isFeatured: false } },
        { new: true }
    );
};

// ─── RESTORE ──────────────────────────────────────────────────────────────────
const restore = async (id) => {
    const exists = await ProductModel.findById(id);
    if (!exists) throw new Error('Producto no encontrado');
    if (exists.isActive) throw new Error('El producto ya se encuentra activo');

    const category = await CategoryModel.findById(exists.categoryId);
    if (!category || !category.isActive) {
        throw new Error('No se puede restaurar el producto porque su categoría está desactivada');
    }

    return await ProductModel.findByIdAndUpdate(
        id,
        { $set: { isActive: true } },
        { new: true }
    );
};

export default {
    getAll,
    getFeatured,
    getById,
    getBySku,
    resolvePrice,
    create,
    update,
    updateStock,
    toggleFeatured,
    softDelete,
    restore
};