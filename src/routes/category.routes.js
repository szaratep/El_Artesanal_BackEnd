import { Router } from 'express';
import {
    getAll,
    getAllRoot,
    getSubcategories,
    getById,
    create,
    update,
    softDelete,
    restore
} from '../controller/category.controller.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                        getAll);             // GET    /api/v1/categories
router.get('/root',                    getAllRoot);          // GET    /api/v1/categories/root
router.get('/:id',                     getById);            // GET    /api/v1/categories/:id
router.get('/:parentId/subcategories', getSubcategories);   // GET    /api/v1/categories/:parentId/subcategories

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',                       create);             // POST   /api/v1/categories

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',                     update);             // PUT    /api/v1/categories/:id
router.put('/:id/restore',             restore);            // PUT    /api/v1/categories/:id/restore

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',                  softDelete);         // DELETE /api/v1/categories/:id

export default router;