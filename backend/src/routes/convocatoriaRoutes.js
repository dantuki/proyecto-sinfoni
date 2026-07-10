const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const verificarToken = require('../middleware/authMiddleware');

// Rutas Públicas
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);

// Rutas Protegidas (Solo Admin/Autorizados)
router.post('/', verificarToken, convocatoriaController.createConvocatoria);
router.put('/:id', verificarToken, convocatoriaController.updateConvocatoria);
router.delete('/:id', verificarToken, convocatoriaController.deleteConvocatoria);

module.exports = router;