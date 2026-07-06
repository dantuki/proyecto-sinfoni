const express = require('express');
const router = express.Router();
const { 
  obtenerTodosLosProyectos, // 👈 Importamos la nueva ruta global
  obtenerMisProyectos, 
  obtenerMisParticipaciones 
} = require('../controllers/proyecto.controller');
const verificarToken = require('../middleware/authMiddleware');

// Ruta global para el portafolio completo (Admin)
router.get('/', verificarToken, obtenerTodosLosProyectos);

// Rutas específicas por ID de usuario (Profesores)
router.get('/director/:id', verificarToken, obtenerMisProyectos);
router.get('/participante/:id', verificarToken, obtenerMisParticipaciones);

module.exports = router;