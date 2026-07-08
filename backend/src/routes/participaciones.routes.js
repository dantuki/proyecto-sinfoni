const express = require('express');
const router = express.Router();
const participacionesController = require('../controllers/participacionesController');
const verificarToken = require('../middleware/authMiddleware');

// Ambas rutas quedan blindadas con el verificador de tokens de SINFONI
router.get('/', verificarToken, participacionesController.getParticipaciones);
router.post('/', verificarToken, participacionesController.crearVinculacion);

module.exports = router;