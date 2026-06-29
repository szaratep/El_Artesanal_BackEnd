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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                                  authenticationUser, authorizationUser(ROLES.ADMIN), getAll);
router.get('/:id',                               authenticationUser, authorizationUser(ROLES.ADMIN), getById);
router.get('/transaction/:gatewayTransactionId', authenticationUser, authorizationUser(ROLES.ADMIN), getByGatewayTransactionId);
// El cliente consulta el pago de su propia orden → el orderId no es el userId
// la verificacion de propiedad se hace en el service (orden pertenece al usuario)
router.get('/order/:orderId', authenticationUser, authorizationUser(ALLOWED_ROLES), getByOrder);

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/', authenticationUser, authorizationUser(ALLOWED_ROLES), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id/status', authenticationUser, authorizationUser(ROLES.ADMIN), updateStatus);
router.put('/:id/refund', authenticationUser, authorizationUser(ROLES.ADMIN), processRefund);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ROLES.ADMIN), hardDelete);

export default router;