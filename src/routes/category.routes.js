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
import authenticationUser from '../middleware/authentication.middleware.js';
import authorizationUser  from '../middleware/authorization.middleware.js';
import { ROLES } from '../config/global.config.js';

const router = Router();

// ─── GET ──────────────────────────────────────────────────────────────────────
// Publicas - cualquier visitante puede ver el catalogo
// verifyOwnResource no aplica: las categorias son recursos globales, no de un usuario
router.get('/',                        getAll);
router.get('/root',                    getAllRoot);
router.get('/:id',                     getById);
router.get('/:parentId/subcategories', getSubcategories);

// ─── POST ─────────────────────────────────────────────────────────────────────
router.post('/', authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), create);

// ─── PUT ──────────────────────────────────────────────────────────────────────
router.put('/:id',         authenticationUser, authorizationUser(ROLES.ADMIN, ROLES.EDITOR), update);
router.put('/:id/restore', authenticationUser, authorizationUser(ROLES.ADMIN), restore);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authenticationUser, authorizationUser(ROLES.ADMIN), softDelete);

export default router;