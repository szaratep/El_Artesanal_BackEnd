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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
// Publica - el cliente ve las promos vigentes en tienda
// verifyOwnResource no aplica: las promociones son recursos globales
router.get('/active', getActive);
router.get('/',    authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), getAll);
router.get('/:id', authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), getById);

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',          authenticationUser, authorizationUser(ROLES.ADMIN), create);
router.post('/:id/apply', authenticationUser, authorizationUser(ALLOWED_ROLES), applyPromotion);

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',         authenticationUser, authorizationUser(ROLES.ADMIN), update);
router.put('/:id/restore', authenticationUser, authorizationUser(ROLES.ADMIN), restore);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ROLES.ADMIN), softDelete);

export default router;