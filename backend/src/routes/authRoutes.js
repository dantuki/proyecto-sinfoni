const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();

// Ruta para guardar usuarios desde la pantalla "Solicitud de Cuenta"
router.post('/register', authController.register);

// Ruta para verificar usuarios desde la pantalla "Autenticación"
router.post('/login', authController.login);

module.exports = router;