import { Schema, model } from "mongoose";

const PromotionSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la promoción es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [300, 'La descripción no puede exceder los 300 caracteres'],
        default: ''
    },
    discountType: {
        type: String,
        required: [true, 'El tipo de descuento es obligatorio'],
        enum: {
            values: ['Porcentaje', 'Monto fijo'],
            message: 'El tipo de descuento debe ser "Porcentaje" o "Monto fijo"'
        }
    },
    discountValue: {
        type: Number,
        required: [true, 'El valor del descuento es obligatorio'],
        min: [0, 'El valor del descuento no puede ser negativo']
    },
    scope: {
        type: String,
        required: [true, 'El alcance de la promoción es obligatorio'],
        enum: {
            values: ['productos', 'categorias'],
            message: 'El alcance debe ser "productos" 0 "categorias"'
        }
    },
    applicableProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'products'
    }],
    applicableCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'categories'
    }],
    startDate: {
        type: Date,
        required: [true, 'La fecha de inicio de la promoción es obligatoria']
    },
    endDate: {
        type: Date,
        required: [true, 'La fecha de fin de la promoción es obligatoria']
    },
    maxUses: {
        type: Number,
        min: [1, 'El límite de usos debe ser al menos 1'],
        default: null
    },
    currentUses: {
        type: Number,
        min: [0, 'El contador de usos no puede ser negativo'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'El administrador que crea la promoción es obligatorio']
    }
}, {
    versionKey: false,
    timestamps: true
});

const PromotionModel = model('promotions', PromotionSchema);

export default PromotionModel;