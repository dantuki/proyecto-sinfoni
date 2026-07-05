const express = require('express');
const router = express.Router();
const { obtenerMisProyectos, obtenerMisParticipaciones } = require('../controllers/proyecto.controller');
const verificarToken = require('../middlewares/auth.middleware'); // Tu middleware de protección

// Ambas rutas protegidas por token para asegurar que nadie husmee proyectos ajenos
router.get('/director/:id', verificarToken, obtenerMisProyectos);
router.get('/participante/:id', verificarToken, obtenerMisParticipaciones);

module.exports = router;