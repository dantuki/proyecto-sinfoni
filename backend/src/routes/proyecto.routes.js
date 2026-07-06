const express = require('express');
const router = express.Router();
const { 
  obtenerTodosLosProyectos, 
  obtenerMisProyectos, 
  obtenerMisParticipaciones,
  crearProyecto,
  obtenerDocumentosProyecto,
  crearDocumentoProyecto
} = require('../controllers/proyecto.controller');
const verificarToken = require('../middleware/authMiddleware');

// Rutas globales del portafolio (Peticiones raíz)
router.get('/', verificarToken, obtenerTodosLosProyectos);
router.post('/', verificarToken, crearProyecto);

// Rutas de segmentación para perfiles docentes por ID
router.get('/director/:id', verificarToken, obtenerMisProyectos);
router.get('/participante/:id', verificarToken, obtenerMisParticipaciones);

// Rutas del Repositorio de Documentación por ID de Proyecto
router.get('/:id/documentos', verificarToken, obtenerDocumentosProyecto);
router.post('/:id/documentos', verificarToken, crearDocumentoProyecto);

module.exports = router;