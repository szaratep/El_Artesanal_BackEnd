import { Router } from 'express';
import {
    getAll,
    getById,
    getByUser,
    create,
    update,
    setDefault,
    hardDelete
} from '../controller/contact.controller.js';
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',             authenticationUser, authorizationUser(ROLES.ADMIN), getAll);
router.get('/:id',          authenticationUser, authorizationUser(ROLES.ADMIN), getById);
// Cada usuario consulta sus propios contactos por userId
router.get('/user/:userId', authenticationUser, authorizationUser(ALLOWED_ROLES), getByUser);

// ─── POST ─────────────────────────────────────────────────────────────────────
// Create no necesita verifyOwnResource porque el userId viene en el body, no en params
router.post('/', authenticationUser, authorizationUser(ALLOWED_ROLES), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
// El :id aqui es el id del contacto, no del usuario → verifyOwnResource no aplica aqui
// La verificacion de propiedad se hace en el service (contactId pertenece al userId)
router.put('/:id',         authenticationUser, authorizationUser(ALLOWED_ROLES), update);
router.put('/:id/default', authenticationUser, authorizationUser(ALLOWED_ROLES), setDefault);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ALLOWED_ROLES), hardDelete);

export default router;