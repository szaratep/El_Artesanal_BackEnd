import { Schema, model } from "mongoose";

const OrderItemSchema = new Schema({
    itemType: {
        type: String,
        required: [true, 'El tipo de ítem es obligatorio'],
        enum: {
            values: ['Producto', 'Perzonalizado'],
            message: 'El tipo de ítem debe ser "Producto" o "Perzonalizado"'
        }
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'products',
        default: null
    },
    quoteId: {
        type: Schema.Types.ObjectId,
        ref: 'quotes',
        default: null
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad del ítem es obligatoria'],
        min: [1, 'La cantidad debe ser al menos 1']
    }
}, {
    versionKey: false,
    _id: true
});

const OrderSchema = new Schema({
    orderNumber: {
        type: String,
        required: [true, 'El número de orden es obligatorio'],
        unique: true,
        uppercase: true,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'El usuario de la orden es obligatorio']
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: [
                'Pendiente de pago',
                'Pago en procesamiento',
                'Pagado',
                'En preparación',
                'Listo para recoger',
                'Enviado',
                'Entregado',
                'Cancelado',
                'Reembolsado'
            ],
            message: 'El estado de la orden no es válido'
        },
        default: 'Pendiente de pago'
    },
    items: {
        type: [OrderItemSchema],
        validate: {
            validator: (arr) => arr.length >= 1,
            message: 'La orden debe contener al menos un ítem'
        }
    },
    subtotal: {
        type: Number,
        required: [true, 'El subtotal de la orden es obligatorio'],
        min: [0, 'El subtotal no puede ser negativo']
    },
    discountAmount: {
        type: Number,
        min: [0, 'El descuento no puede ser negativo'],
        default: 0
    },
    shippingCost: {
        type: Number,
        min: [0, 'El costo de envío no puede ser negativo'],
        default: 0
    },
    totalAmount: {
        type: Number,
        required: [true, 'El total de la orden es obligatorio'],
        min: [0, 'El total no puede ser negativo']
    },
    promotionId: {
        type: Schema.Types.ObjectId,
        ref: 'promotions',
        default: null
    },
    deliveryType: {
        type: String,
        required: [true, 'El tipo de entrega es obligatorio'],
        enum: {
            values: ['Envío','Recogida'],
            message: 'El tipo de entrega debe ser "Envío" o "Recogida"'
        }
    },
    contactId: {
        type: Schema.Types.ObjectId,
        ref: 'contacts',
        default: null
    },
    trackingNumber: {
        type: String,
        trim: true,
        maxlength: [100, 'El número de guía no puede exceder los 100 caracteres'],
        default: null
    },
    trackingCompany: {
        type: String,
        trim: true,
        maxlength: [80, 'El nombre de la transportadora no puede exceder los 80 caracteres'],
        default: null
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'payments',
        default: null
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Las notas del administrador no pueden exceder los 500 caracteres'],
        default: ''
    }
}, {
    versionKey: false,
    timestamps: true
});

const OrderModel = model('orders', OrderSchema);

export default OrderModel;