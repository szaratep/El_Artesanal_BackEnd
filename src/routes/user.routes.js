import { Router } from 'express';
import {
    getAll,
    getById,
    getByEmail,
    getByNickname,
    create,
    update,
    updateRole,
    updatePassword,
    softDelete,
    restore,
    addContact,
    removeContact
} from '../controller/user.controller.js';
import authenticationUser   from '../middleware/authentication.middleware.js';
import authorizationUser    from '../middleware/authorization.middleware.js';
import verifyOwnResource    from '../middleware/verifyownresource.middleware.js';
import { ROLES, ALLOWED_ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
// Solo administrator puede listar y consultar usuarios
router.get('/',                   authenticationUser, authorizationUser(ROLES.ADMIN), getAll);
router.get('/:id',                authenticationUser, authorizationUser(ROLES.ADMIN), getById);
router.get('/email/:email',       authenticationUser, authorizationUser(ROLES.ADMIN), getByEmail);
router.get('/nickname/:nickname', authenticationUser, authorizationUser(ROLES.ADMIN), getByNickname);

// ─── POST ─────────────────────────────────────────────────────────────────────
// Solo administrator puede crear usuarios directamente
// El registro publico de clientes vive en POST /auth/register
router.post('/', authenticationUser, authorizationUser(ROLES.ADMIN), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
// Cualquier usuario autenticado pero SOLO puede modificar su propio perfil
// verifyOwnResource permite al admin modificar cualquiera, al resto solo el suyo
router.put('/:id',          authenticationUser, authorizationUser(ALLOWED_ROLES), verifyOwnResource, update);

// Solo administrator puede cambiar el rol de un usuario
router.put('/:id/role',     authenticationUser, authorizationUser(ROLES.ADMIN), updateRole);

// Cualquier usuario autenticado pero SOLO puede cambiar su propia contraseña
router.put('/:id/password', authenticationUser, authorizationUser(ALLOWED_ROLES), verifyOwnResource, updatePassword);

// Solo administrator puede restaurar una cuenta desactivada
router.put('/:id/restore',  authenticationUser, authorizationUser(ROLES.ADMIN), restore);

// Cualquier usuario autenticado pero SOLO puede gestionar sus propios contactos
router.put('/:id/contacts', authenticationUser, authorizationUser(ALLOWED_ROLES), verifyOwnResource, addContact);

// ─── DELETE ───────────────────────────────────────────────────────────────────
// Solo administrator puede desactivar cuentas
router.delete('/:id',                     authenticationUser, authorizationUser(ROLES.ADMIN), softDelete);

// Cualquier usuario autenticado pero SOLO puede eliminar sus propios contactos
router.delete('/:id/contacts/:contactId', authenticationUser, authorizationUser(ALLOWED_ROLES), verifyOwnResource, removeContact);

export default router;