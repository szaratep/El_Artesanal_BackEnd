import ContactModel from '../models/contact.model.js';
import UserModel    from '../models/user.model.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async ({ page = 1, limit = 10, userId, isDefault } = {}) => {
    const filter = {};

    if (userId    !== undefined) filter.userId    = userId;
    if (isDefault !== undefined) filter.isDefault = isDefault;

    const options = {
        page:     Number(page),
        limit:    Number(limit),
        sort:     { isDefault: -1, createdAt: -1 },
        populate: [
            { path: 'userId', model: 'users', select: 'name nickname email' }
        ],
        lean: false
    };

    return await ContactModel.paginate(filter, options);
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const contact = await ContactModel
        .findById(id)
        .populate({ path: 'userId', model: 'users', select: 'name nickname email' });

    if (!contact) throw new Error('Contacto no encontrado');
    return contact;
};

// ─── GET BY USER ───────────────────────────────────────────────────────────────
const getByUser = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    return await ContactModel
        .find({ userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .populate({ path: 'userId', model: 'users', select: 'name nickname email' });
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const user = await UserModel.findById(data.userId);
    if (!user) throw new Error('Usuario no encontrado');

    // If this contact is set as default, unset previous default for this user
    if (data.isDefault) {
        await ContactModel.updateMany(
            { userId: data.userId, isDefault: true },
            { $set: { isDefault: false } }
        );
    }

    const contact = new ContactModel(data);
    const saved   = await contact.save();

    // Link contact reference in user document
    await UserModel.findByIdAndUpdate(
        data.userId,
        { $push: { contacts: saved._id } }
    );

    return saved;
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const update = async (id, data) => {
    const exists = await ContactModel.findById(id);
    if (!exists) throw new Error('Contacto no encontrado');

    // Prevent userId from being changed
    delete data.userId;

    // If setting this contact as default, unset previous default for this user
    if (data.isDefault === true) {
        await ContactModel.updateMany(
            { userId: exists.userId, isDefault: true, _id: { $ne: id } },
            { $set: { isDefault: false } }
        );
    }

    return await ContactModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).populate({ path: 'userId', model: 'users', select: 'name nickname email' });
};

// ─── SET DEFAULT ──────────────────────────────────────────────────────────────
const setDefault = async (id, userId) => {
    const contact = await ContactModel.findOne({ _id: id, userId });
    if (!contact) throw new Error('Contacto no encontrado');

    // Unset all current defaults for this user
    await ContactModel.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
    );

    return await ContactModel.findByIdAndUpdate(
        id,
        { $set: { isDefault: true } },
        { new: true }
    ).populate({ path: 'userId', model: 'users', select: 'name nickname email' });
};

// ─── HARD DELETE ──────────────────────────────────────────────────────────────
const hardDelete = async (id) => {
    const contact = await ContactModel.findById(id);
    if (!contact) throw new Error('Contacto no encontrado');

    // Remove reference from user document
    await UserModel.findByIdAndUpdate(
        contact.userId,
        { $pull: { contacts: contact._id } }
    );

    await ContactModel.findByIdAndDelete(id);
    return { message: 'Contacto eliminado correctamente' };
};

export default {
    getAll,
    getById,
    getByUser,
    create,
    update,
    setDefault,
    hardDelete
};