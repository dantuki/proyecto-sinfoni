const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const verificarToken = require('../middleware/authMiddleware'); // 👈 El portero

// Rutas Públicas (No requieren Token)
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);

// Rutas Protegidas (Requieren Token para crear, editar o borrar)
router.post('/', verificarToken, convocatoriaController.createConvocatoria);
router.put('/:id', verificarToken, convocatoriaController.updateConvocatoria);
router.delete('/:id', verificarToken, convocatoriaController.deleteConvocatoria);

module.exports = router;