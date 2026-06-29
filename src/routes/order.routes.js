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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import verifyOwnResource  from '../middleware/verifyownresource.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                    authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), getAll);
// El :userId permite que verifyOwnResource valide que consulta su propio historial
router.get('/user/:userId',        authenticationUser, authorizationUser(ALLOWED_ROLES), verifyOwnResource, getByUser);
router.get('/number/:orderNumber', authenticationUser, authorizationUser(ALLOWED_ROLES), getByOrderNumber);
router.get('/:id',                 authenticationUser, authorizationUser(ALLOWED_ROLES), getById);

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/', authenticationUser, authorizationUser(ALLOWED_ROLES), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id/status',   authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), updateStatus);
router.put('/:id/tracking', authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), updateTracking);
router.put('/:id/payment',  authenticationUser, authorizationUser(ROLES.ADMIN), setPayment);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ROLES.ADMIN), hardDelete);

export default router;