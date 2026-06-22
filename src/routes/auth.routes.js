import { Router } from "express"
import { create } from "../controller/user.controller.js";
import { loginUser, reNewToken } from "../controller/auth.controller.js";
import authenticationUser from "../middleware/authentication.middleware.js";
import removeRol from "../middleware/without-rol.middleware.js";

const router = Router();

// Define las rutas que manejan el flujo de autenticacion (USER);
// http:localhost:3000/api/auth
router.post('/login', loginUser);
router.post('/register', removeRol, create);
router.get('/renew-token', authenticationUser, reNewToken);

export default router;