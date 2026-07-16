const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const verificarToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Definimos los 4 campos específicos que enviará el frontend para los archivos PDF
const uploadFields = upload.fields([
  { name: 'presupuesto', maxCount: 1 },
  { name: 'cronograma', maxCount: 1 },
  { name: 'honestidad', maxCount: 1 },
  { name: 'identidad', maxCount: 1 }
]);

// Rutas Públicas o de Lectura
router.get('/', solicitudController.getSolicitudes);
router.get('/:id', solicitudController.getSolicitudById);

// Rutas Protegidas con Subida de Archivos Específicos
router.post('/', verificarToken, uploadFields, solicitudController.createSolicitud);
router.put('/:id', verificarToken, uploadFields, solicitudController.updateSolicitud);
router.delete('/:id', verificarToken, solicitudController.deleteSolicitud);

module.exports = router;