const express = require('express');
const router = express.Router();
const { obtenerMisProyectos, obtenerMisParticipaciones } = require('../controllers/proyecto.controller');
const verificarToken = require('../middleware/authMiddleware');

// Ambas rutas protegidas por token
router.get('/director/:id', verificarToken, obtenerMisProyectos);
router.get('/participante/:id', verificarToken, obtenerMisParticipaciones);

module.exports = router;