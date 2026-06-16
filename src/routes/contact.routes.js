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

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
router.get('/',                getAll);      // GET    /api/v1/contacts
router.get('/:id',             getById);     // GET    /api/v1/contacts/:id
router.get('/user/:userId',    getByUser);   // GET    /api/v1/contacts/user/:userId

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/',               create);      // POST   /api/v1/contacts

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',             update);      // PUT    /api/v1/contacts/:id
router.put('/:id/default',     setDefault);  // PUT    /api/v1/contacts/:id/default

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id',          hardDelete);  // DELETE /api/v1/contacts/:id

export default router;