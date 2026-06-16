import { Router } from 'express';
import {
    getAll,
    getById,
    getByUser,
    getByOrderNumber,
    create,
    updateStatus,
    updateTracking,
    setPayment,
    hardDelete
} from '../controller/order.controller.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                    getAll);            // GET    /api/v1/orders
router.get('/number/:orderNumber',  getByOrderNumber);  // GET    /api/v1/orders/number/:orderNumber
router.get('/user/:userId',         getByUser);         // GET    /api/v1/orders/user/:userId
router.get('/:id',                  getById);           // GET    /api/v1/orders/:id

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',                    create);            // POST   /api/v1/orders

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id/status',           updateStatus);      // PUT    /api/v1/orders/:id/status
router.put('/:id/tracking',         updateTracking);    // PUT    /api/v1/orders/:id/tracking
router.put('/:id/payment',          setPayment);        // PUT    /api/v1/orders/:id/payment

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',               hardDelete);        // DELETE /api/v1/orders/:id

export default router;