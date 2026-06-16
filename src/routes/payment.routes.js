import { Router } from 'express';
import {
    getAll,
    getById,
    getByOrder,
    getByGatewayTransactionId,
    create,
    updateStatus,
    processRefund,
    hardDelete
} from '../controller/payment.controller.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                                       getAll);                     // GET    /api/v1/payments
router.get('/transaction/:gatewayTransactionId',        getByGatewayTransactionId); // GET    /api/v1/payments/transaction/:gatewayTransactionId
router.get('/order/:orderId',                           getByOrder);                // GET    /api/v1/payments/order/:orderId
router.get('/:id',                                      getById);                   // GET    /api/v1/payments/:id

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',                                        create);                    // POST   /api/v1/payments

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id/status',                               updateStatus);              // PUT    /api/v1/payments/:id/status
router.put('/:id/refund',                                processRefund);             // PUT    /api/v1/payments/:id/refund

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',                                    hardDelete);                // DELETE /api/v1/payments/:id

export default router;