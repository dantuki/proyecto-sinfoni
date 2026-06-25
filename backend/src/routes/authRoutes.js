import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken, verifyCaptcha, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas Públicas de Autenticación (Pasan por verificación de CAPTCHA si está activa)
router.post('/register', verifyCaptcha, authController.register);
router.post('/login', verifyCaptcha, authController.login);
router.post('/forgot-password', verifyCaptcha, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Ejemplo de Ruta Protegida por JWT y Rol para verificar funcionamiento
router.get('/admin-only', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.status(200).json({ message: 'Bienvenido al panel exclusivo de Administradores.', user: req.user });
});

export default router;