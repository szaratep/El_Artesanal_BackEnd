import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [150, 'El nombre no puede exceder los 150 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción del producto es obligatoria'],
        trim: true,
        minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
        maxlength: [1000, 'La descripción no puede exceder los 1000 caracteres']
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: [true, 'La categoría del producto es obligatoria']
    },
    sku: {
        type: String,
        required: [true, 'El SKU del producto es obligatorio'],
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9-_]+$/, 'El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'],
        maxlength: [10, 'El SKU no puede exceder los 30 caracteres']
    },
    images: {
        type: [String],
        validate: [
            {
                validator: (arr) => arr.length >= 1,
                message: 'El producto debe tener al menos 1 imagen'
            },
            {
                validator: (arr) => arr.length <= 4,
                message: 'El producto no puede tener más de 8 imágenes'
            }
        ],
        default: []
    },
    unitPrice: {
        type: Number,
        required: [true, 'El precio unitario es obligatorio'],
        min: [0, 'El precio unitario no puede ser negativo']
    },
    wholesalePrice: {
        type: Number,
        required: [true, 'El precio al por mayor es obligatorio'],
        min: [0, 'El precio al por mayor no puede ser negativo']
    },
    wholesaleMinQty: {
        type: Number,
        required: [true, 'La cantidad mínima para precio mayorista es obligatoria'],
        min: [3, 'La cantidad mínima para precio mayorista debe ser al menos 2'],
        default: 3
    },
    material: {
        type: String,
        required: [true, 'El material del producto es obligatorio'],
        trim: true,
        maxlength: [50, 'El material no puede exceder los 50 caracteres']
    },
    widthCm: {
        type: Number,
        min: [0, 'El ancho no puede ser negativo'],
        default: null
    },
    heightCm: {
        type: Number,
        min: [0, 'El alto no puede ser negativo'],
        default: null
    },
    depthCm: {
        type: Number,
        min: [0, 'La profundidad no puede ser negativa'],
        default: null
    },
    stock: {
        type: Number,
        required: [true, 'El stock del producto es obligatorio'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: {
        type: [String],
        validate: {
            validator: (arr) => arr.length <= 10,
            message: 'El producto no puede tener más de 10 etiquetas'
        },
        default: []
    }
}, {
    versionKey: false,
    timestamps: true
});

const ProductModel = model('products', ProductSchema);

export default ProductModel;