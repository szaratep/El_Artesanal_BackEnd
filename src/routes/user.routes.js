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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser from '../middleware/authorization.middleware.js';
import { ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',authenticationUser, authorizationUser(ROLES.ADMIN), getAll);           // GET    /api/v1/users
router.get('/:id',                 getById);          // GET    /api/v1/users/:id
router.get('/email/:email',        getByEmail);       // GET    /api/v1/users/email/:email
router.get('/nickname/:nickname',  getByNickname);    // GET    /api/v1/users/nickname/:nickname

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',                   create);           // POST   /api/v1/users

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',                 update);           // PUT    /api/v1/users/:id
router.put('/:id/role',            updateRole);       // PUT    /api/v1/users/:id/role
router.put('/:id/password',        updatePassword);   // PUT    /api/v1/users/:id/password
router.put('/:id/restore',         restore);          // PUT    /api/v1/users/:id/restore
router.put('/:id/contacts',        addContact);       // PUT    /api/v1/users/:id/contacts

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',                          softDelete);     // DELETE /api/v1/users/:id
router.delete('/:id/contacts/:contactId',      removeContact);  // DELETE /api/v1/users/:id/contacts/:contactId

export default router;