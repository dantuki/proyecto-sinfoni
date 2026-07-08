const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const verificarToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Rutas Públicas o de Lectura
router.get('/', solicitudController.getSolicitudes);
router.get('/:id', solicitudController.getSolicitudById);

// Rutas Protegidas con Subida Dinámica de Archivos en Arreglo
router.post('/', verificarToken, upload.array('archivos', 10), solicitudController.createSolicitud);
router.put('/:id', verificarToken, upload.array('archivos', 10), solicitudController.updateSolicitud);
router.delete('/:id', verificarToken, solicitudController.deleteSolicitud);

module.exports = router;