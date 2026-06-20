import { Router } from 'express';
import {
    getAll,
    getFeatured,
    getById,
    getBySku,
    resolvePrice,
    create,
    update,
    updateStock,
    toggleFeatured,
    softDelete,
    restore
} from '../controller/product.controller.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                getAll);          // GET    /api/v1/products
router.get('/featured',        getFeatured);     // GET    /api/v1/products/featured
router.get('/sku/:sku',        getBySku);        // GET    /api/v1/products/sku/:sku
router.get('/:id',             getById);         // GET    /api/v1/products/:id
router.get('/:id/price',       resolvePrice);    // GET    /api/v1/products/:id/price?quantity=5

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',               create);          // POST   /api/v1/products

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',             update);          // PUT    /api/v1/products/:id
router.put('/:id/stock',       updateStock);     // PUT    /api/v1/products/:id/stock
router.put('/:id/featured',    toggleFeatured);  // PUT    /api/v1/products/:id/featured
router.put('/:id/restore',     restore);         // PUT    /api/v1/products/:id/restore

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',          softDelete);      // DELETE /api/v1/products/:id

export default router;