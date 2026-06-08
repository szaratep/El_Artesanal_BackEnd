import { Schema, model } from "mongoose";

const PaymentSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'orders',
        required: [true, 'La orden asociada al pago es obligatoria'],
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'El usuario que realiza el pago es obligatorio']
    },
    gateway: {
        type: String,
        required: [true, 'La pasarela de pago es obligatoria'],
        enum: {
            values: ['wompi', 'payu'],
            message: 'La pasarela de pago no es válida'
        }
    },
    gatewayTransactionId: {
        type: String,
        required: [true, 'El ID de transacción de la pasarela es obligatorio'],
        unique: true,
        trim: true,
        maxlength: [150, 'El ID de transacción no puede exceder los 150 caracteres']
    },
    gatewayReference: {
        type: String,
        trim: true,
        maxlength: [150, 'La referencia de pago no puede exceder los 150 caracteres'],
        default: null
    },
    amount: {
        type: Number,
        required: [true, 'El monto del pago es obligatorio'],
        min: [0, 'El monto no puede ser negativo']
    },
    currency: {
        type: String,
        required: true,
        enum: {
            values: ['COP'],
            message: 'La moneda debe ser COP'
        },
        default: 'COP'
    },
    paymentMethod: {
        type: String,
        required: [true, 'El método de pago es obligatorio'],
        enum: {
            values: ['PSE', 'Tarjeta de crédito', 'Tarjeta de débito', 'Nequi'],
            message: 'El método de pago no es válido'
        }
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: [ 'Pendiente', 'En procesamiento', 'Aprobado', 'Rechazado', 'Reembolsado', 'Fallido', 'Anulado' ],
            message: 'El estado del pago no es válido'
        },
        default: 'Pendiente'
    },
    gatewayResponse: {
        type: Schema.Types.Mixed,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    refundedAt: {
        type: Date,
        default: null
    },
    refundAmount: {
        type: Number,
        min: [0, 'El monto del reembolso no puede ser negativo'],
        default: null
    },
    failureReason: {
        type: String,
        trim: true,
        maxlength: [300, 'La razón del fallo no puede exceder los 300 caracteres'],
        default: null
    }
}, {
    versionKey: false,
    timestamps: true
});

const PaymentModel = model('payments', PaymentSchema);

export default PaymentModel;