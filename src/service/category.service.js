import CategoryModel from '../models/Category.model.js';
import ProductModel  from '../models/Product.model.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async ({ page = 1, limit = 10, isActive, parentCategoryId } = {}) => {
    const filter = {};

    if (isActive         !== undefined) filter.isActive         = isActive;
    if (parentCategoryId !== undefined) filter.parentCategoryId = parentCategoryId === 'null' ? null : parentCategoryId;

    const options = {
        page:     Number(page),
        limit:    Number(limit),
        sort:     { order: 1, createdAt: -1 },
        populate: [
            { path: 'parentCategoryId', model: 'categories', select: 'name isActive' }
        ],
        lean: false
    };

    return await CategoryModel.paginate(filter, options);
};

// ─── GET ALL ROOT (sin padre) ─────────────────────────────────────────────────
const getAllRoot = async () => {
    return await CategoryModel
        .find({ parentCategoryId: null, isActive: true })
        .sort({ order: 1, createdAt: -1 });
};

// ─── GET SUBCATEGORIES ────────────────────────────────────────────────────────
const getSubcategories = async (parentId) => {
    const parent = await CategoryModel.findById(parentId);
    if (!parent) throw new Error('Categoría padre no encontrada');

    return await CategoryModel
        .find({ parentCategoryId: parentId, isActive: true })
        .sort({ order: 1, createdAt: -1 });
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const category = await CategoryModel
        .findById(id)
        .populate({ path: 'parentCategoryId', model: 'categories', select: 'name isActive' });

    if (!category) throw new Error('Categoría no encontrada');
    return category;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const nameExists = await CategoryModel.findOne({
        name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
    });
    if (nameExists) throw new Error('Ya existe una categoría con ese nombre');

    if (data.parentCategoryId) {
        const parent = await CategoryModel.findById(data.parentCategoryId);
        if (!parent) throw new Error('La categoría padre no existe');
        if (!parent.isActive) throw new Error('La categoría padre se encuentra desactivada');
    }

    const category = new CategoryModel(data);
    return await category.save();
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const update = async (id, data) => {
    const exists = await CategoryModel.findById(id);
    if (!exists) throw new Error('Categoría no encontrada');

    if (data.name) {
        const nameTaken = await CategoryModel.findOne({
            name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
            _id:  { $ne: id }
        });
        if (nameTaken) throw new Error('Ya existe una categoría con ese nombre');
    }

    if (data.parentCategoryId) {
        if (data.parentCategoryId.toString() === id.toString()) {
            throw new Error('Una categoría no puede ser su propia categoría padre');
        }
        const parent = await CategoryModel.findById(data.parentCategoryId);
        if (!parent) throw new Error('La categoría padre no existe');
        if (!parent.isActive) throw new Error('La categoría padre se encuentra desactivada');
    }

    return await CategoryModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).populate({ path: 'parentCategoryId', model: 'categories', select: 'name isActive' });
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
const softDelete = async (id) => {
    const exists = await CategoryModel.findById(id);
    if (!exists) throw new Error('Categoría no encontrada');
    if (!exists.isActive) throw new Error('La categoría ya se encuentra desactivada');

    // Check if category has active products
    const activeProducts = await ProductModel.countDocuments({ categoryId: id, isActive: true });
    if (activeProducts > 0) {
        throw new Error(`No se puede desactivar la categoría porque tiene ${activeProducts} producto(s) activo(s) asociado(s)`);
    }

    // Also deactivate subcategories
    await CategoryModel.updateMany(
        { parentCategoryId: id },
        { $set: { isActive: false } }
    );

    return await CategoryModel.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
    );
};

// ─── RESTORE ──────────────────────────────────────────────────────────────────
const restore = async (id) => {
    const exists = await CategoryModel.findById(id);
    if (!exists) throw new Error('Categoría no encontrada');
    if (exists.isActive) throw new Error('La categoría ya se encuentra activa');

    return await CategoryModel.findByIdAndUpdate(
        id,
        { $set: { isActive: true } },
        { new: true }
    );
};

export default {
    getAll,
    getAllRoot,
    getSubcategories,
    getById,
    create,
    update,
    softDelete,
    restore
};