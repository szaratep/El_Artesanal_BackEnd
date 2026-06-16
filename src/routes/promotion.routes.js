import { Router } from 'express';
import {
    getAll,
    getActive,
    getById,
    create,
    update,
    applyPromotion,
    softDelete,
    restore
} from '../controller/promotion.controller.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',            getAll);           // GET    /api/v1/promotions
router.get('/active',      getActive);        // GET    /api/v1/promotions/active
router.get('/:id',         getById);          // GET    /api/v1/promotions/:id

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',           create);           // POST   /api/v1/promotions
router.post('/:id/apply',  applyPromotion);   // POST   /api/v1/promotions/:id/apply

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',         update);           // PUT    /api/v1/promotions/:id
router.put('/:id/restore', restore);          // PUT    /api/v1/promotions/:id/restore

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',      softDelete);       // DELETE /api/v1/promotions/:id

export default router;