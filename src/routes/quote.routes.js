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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import verifyOwnResource  from '../middleware/verifyownresource.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                    authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), getAll);
// El :userId en la ruta permite que verifyOwnResource valide que es su propio historial
router.get('/user/:userId',        authenticationUser, authorizationUser(ALLOWED_ROLES), verifyOwnResource, getByUser);
router.get('/number/:quoteNumber', authenticationUser, authorizationUser(ALLOWED_ROLES), getByQuoteNumber);
router.get('/:id',                 authenticationUser, authorizationUser(ALLOWED_ROLES), getById);

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/', authenticationUser, authorizationUser(ALLOWED_ROLES), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',             authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), update);
router.put('/:id/status',      authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), updateStatus);
router.put('/:id/final-price', authenticationUser, authorizationUser(ROLES.ADMIN), setFinalPrice);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ROLES.ADMIN), hardDelete);

export default router;