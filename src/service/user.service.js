import UserModel from '../models/User.model.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async ({ page = 1, limit = 10, role, isActive } = {}) => {
    const filter = {};

    if (role !== undefined)     filter.role     = role;
    if (isActive !== undefined) filter.isActive = isActive;

    const options = {
        page:     Number(page),
        limit:    Number(limit),
        sort:     { createdAt: -1 },
        populate: [
            { path: 'contacts', model: 'contacts' }
        ],
        lean: false
    };

    return await UserModel.paginate(filter, options);
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
    const user = await UserModel
        .findById(id)
        .populate({ path: 'contacts', model: 'contacts' });

    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

// ─── GET BY EMAIL ──────────────────────────────────────────────────────────────
const getByEmail = async (email) => {
    const user = await UserModel
        .findOne({ email: email.toLowerCase().trim() })
        .populate({ path: 'contacts', model: 'contacts' });

    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

// ─── GET BY NICKNAME ───────────────────────────────────────────────────────────
const getByNickname = async (nickname) => {
    const user = await UserModel
        .findOne({ nickname: nickname.toLowerCase().trim() })
        .populate({ path: 'contacts', model: 'contacts' });

    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
const create = async (data) => {
    const emailExists = await UserModel.findOne({ email: data.email?.toLowerCase().trim() });
    if (emailExists) throw new Error('El correo electrónico ya está registrado');

    const nicknameExists = await UserModel.findOne({ nickname: data.nickname?.toLowerCase().trim() });
    if (nicknameExists) throw new Error('El nickname ya está en uso');

    const user = new UserModel(data);
    return await user.save();
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
const update = async (id, data) => {
    const exists = await UserModel.findById(id);
    if (!exists) throw new Error('Usuario no encontrado');

    if (data.email) {
        const emailTaken = await UserModel.findOne({
            email: data.email.toLowerCase().trim(),
            _id:   { $ne: id }
        });
        if (emailTaken) throw new Error('El correo electrónico ya está registrado');
    }

    if (data.nickname) {
        const nicknameTaken = await UserModel.findOne({
            nickname: data.nickname.toLowerCase().trim(),
            _id:      { $ne: id }
        });
        if (nicknameTaken) throw new Error('El nickname ya está en uso');
    }

    // Prevent role and password from being updated via this service
    delete data.role;
    delete data.password;

    return await UserModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).populate({ path: 'contacts', model: 'contacts' });
};

// ─── UPDATE ROLE ───────────────────────────────────────────────────────────────
const updateRole = async (id, role) => {
    const exists = await UserModel.findById(id);
    if (!exists) throw new Error('Usuario no encontrado');

    return await UserModel.findByIdAndUpdate(
        id,
        { $set: { role } },
        { new: true, runValidators: true }
    );
};

// ─── UPDATE PASSWORD ───────────────────────────────────────────────────────────
const updatePassword = async (id, hashedPassword) => {
    const exists = await UserModel.findById(id);
    if (!exists) throw new Error('Usuario no encontrado');

    return await UserModel.findByIdAndUpdate(
        id,
        { $set: { password: hashedPassword } },
        { new: true }
    );
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
const softDelete = async (id) => {
    const exists = await UserModel.findById(id);
    if (!exists) throw new Error('Usuario no encontrado');
    if (!exists.isActive) throw new Error('El usuario ya se encuentra desactivado');  // fixed: was checking exists.status

    return await UserModel.findByIdAndUpdate(
        id,
        { $set: { status: false } },
        { new: true }
    );
};

// ─── RESTORE ──────────────────────────────────────────────────────────────────
const restore = async (id) => {
    const exists = await UserModel.findById(id);
    if (!exists) throw new Error('Usuario no encontrado');
    if (exists.status) throw new Error('El usuario ya se encuentra activo');

    return await UserModel.findByIdAndUpdate(
        id,
        { $set: { status: true } },
        { new: true }
    );
};

// ─── ADD CONTACT REF ──────────────────────────────────────────────────────────
const addContact = async (userId, contactId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const alreadyLinked = user.contacts.some(c => c.toString() === contactId.toString());
    if (alreadyLinked) throw new Error('El contacto ya está vinculado al usuario');

    return await UserModel.findByIdAndUpdate(
        userId,
        { $push: { contacts: contactId } },
        { new: true }
    ).populate({ path: 'contacts', model: 'contacts' });
};

// ─── REMOVE CONTACT REF ───────────────────────────────────────────────────────
const removeContact = async (userId, contactId) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const linked = user.contacts.some(c => c.toString() === contactId.toString());
    if (!linked) throw new Error('El contacto no está vinculado a este usuario');

    return await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { contacts: contactId } },
        { new: true }
    ).populate({ path: 'contacts', model: 'contacts' });
};

export default {
    getAll,
    getById,
    getByEmail,
    getByNickname,
    create,
    update,
    updateRole,
    updatePassword,
    softDelete,
    restore,
    addContact,
    removeContact
};