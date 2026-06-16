import { Router } from 'express';
import {
    getAll,
    getById,
    getByUser,
    getByQuoteNumber,
    create,
    update,
    updateStatus,
    setFinalPrice,
    hardDelete
} from '../controller/quote.controller.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                        getAll);             // GET    /api/v1/quotes
router.get('/number/:quoteNumber',      getByQuoteNumber);  // GET    /api/v1/quotes/number/:quoteNumber
router.get('/user/:userId',             getByUser);         // GET    /api/v1/quotes/user/:userId
router.get('/:id',                      getById);           // GET    /api/v1/quotes/:id

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',                        create);            // POST   /api/v1/quotes

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',                      update);            // PUT    /api/v1/quotes/:id
router.put('/:id/status',               updateStatus);      // PUT    /api/v1/quotes/:id/status
router.put('/:id/final-price',          setFinalPrice);     // PUT    /api/v1/quotes/:id/final-price

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',                   hardDelete);        // DELETE /api/v1/quotes/:id

export default router;