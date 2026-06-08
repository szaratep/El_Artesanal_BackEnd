import { Schema, model } from "mongoose";

const QuoteSchema = new Schema({
    quoteNumber: {
        type: String,
        required: [true, 'El número de cotización es obligatorio'],
        unique: true,
        uppercase: true,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'El usuario que solicita la cotización es obligatorio']
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: [
                'Pendiente de revisión',
                'Cotizado',
                'Aprobado por el cliente',
                'Anticipo pagado',
                'En diseño',
                'Revisión de diseño',
                'Diseño aprobado',
                'En producción',
                'Listo',
                'Entregado',
                'Cancelado'
            ],
            message: 'El estado de la cotización no es válido'
        },
        default: 'Pendiente de revisión'
    },
    designDescription: {
        type: String,
        required: [true, 'La descripción del diseño es obligatoria'],
        trim: true,
        minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
        maxlength: [1000, 'La descripción no puede exceder los 1000 caracteres']
    },
    referenceImages: {
        type: [String],
        validate: {
            validator: (arr) => arr.length <= 5,
            message: 'No se pueden adjuntar más de 5 imágenes de referencia'
        },
        default: []
    },
    material: {
        type: String,
        required: [true, 'El material del personalizado es obligatorio'],
        trim: true,
        maxlength: [50, 'El material no puede exceder los 50 caracteres']
    },
    dimensions: {
        type: String,
        required: [true, 'Las dimensiones aproximadas son obligatorias'],
        trim: true,
        maxlength: [100, 'Las dimensiones no pueden exceder los 100 caracteres']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad de unidades es obligatoria'],
        min: [1, 'La cantidad debe ser al menos 1'],
        default: 1
    },
    estimatedPrice: {
        type: Number,
        min: [0, 'El precio estimado no puede ser negativo'],
        default: null
    },
    finalPrice: {
        type: Number,
        min: [0, 'El precio final no puede ser negativo'],
        default: null
    },
    depositAmount: {
        type: Number,
        min: [0, 'El monto del abono no puede ser negativo'],
        default: null
    },
    depositPaidAt: {
        type: Date,
        default: null
    },
    designApprovedAt: {
        type: Date,
        default: null
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Las notas del administrador no pueden exceder los 1000 caracteres'],
        default: ''
    },
    clientNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Las notas del cliente no pueden exceder los 1000 caracteres'],
        default: ''
    },
    whatsappContact: {
        type: String,
        trim: true,
        match: [/^[+0-9\s-]+$/, 'El número de WhatsApp solo puede contener números, espacios y guiones'],
        maxlength: [20, 'El número de WhatsApp no puede exceder los 20 caracteres'],
        default: null
    }
}, {
    versionKey: false,
    timestamps: true
});

const QuoteModel = model('quotes', QuoteSchema);

export default QuoteModel;