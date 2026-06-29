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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
// Publicas - cualquier visitante puede ver el catalogo
// verifyOwnResource no aplica: los productos son recursos globales, no de un usuario
router.get('/',          getAll);
router.get('/featured',  getFeatured);
router.get('/sku/:sku',  getBySku);
router.get('/:id',       getById);
router.get('/:id/price', authenticationUser, authorizationUser(ALLOWED_ROLES), resolvePrice);

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/', authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',          authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), update);
router.put('/:id/stock',    authenticationUser, authorizationUser(ROLES.ADMIN), updateStock);
router.put('/:id/featured', authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), toggleFeatured);
router.put('/:id/restore',  authenticationUser, authorizationUser(ROLES.ADMIN), restore);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ROLES.ADMIN), softDelete);

export default router;