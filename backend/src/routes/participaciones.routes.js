const express = require('express');
const router = express.Router();
const participacionesController = require('../controllers/participacionesController');
const verificarToken = require('../middleware/authMiddleware');

// Obtener participaciones 
// (Si es Admin ve todas, si es Investigador el controlador filtra por su Token)
router.get('/', verificarToken, participacionesController.getParticipaciones);

// Registrar una nueva vinculación de investigador (Acción de Admin)
router.post('/', verificarToken, participacionesController.crearVinculacion);

module.exports = router;