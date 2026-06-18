const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const verificarToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Rutas Públicas o de Lectura
router.get('/', solicitudController.getSolicitudes);
router.get('/:id', solicitudController.getSolicitudById);

// Rutas Protegidas y con Subida de Archivos
// Se valida el token y luego se interceptan los PDFs si los hay
router.post('/', verificarToken, upload.fields([
{ name: 'doc_par_1', maxCount: 1 }, 
{ name: 'doc_par_2', maxCount: 1 }
]), solicitudController.createSolicitud);

router.put('/:id', verificarToken, solicitudController.updateSolicitud);
router.delete('/:id', verificarToken, solicitudController.deleteSolicitud);

module.exports = router;