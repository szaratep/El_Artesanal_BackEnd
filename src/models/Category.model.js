import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true,
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [80, 'El nombre no puede exceder los 80 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [300, 'La descripción no puede exceder los 300 caracteres'],
        default: ''
    },
    parentCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        min: [0, 'El orden no puede ser negativo'],
        default: 0
    }
}, {
    versionKey: false,
    timestamps: true
});

const CategoryModel = model('categories', CategorySchema);

export default CategoryModel;