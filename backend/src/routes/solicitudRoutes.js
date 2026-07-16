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

// --- RUTAS PROTEGIDAS Y DE CONTROL DE ROLES ---

// Obtener solicitudes (Si es Admin ve todas, si es Docente solo las suyas)
router.get('/', verificarToken, solicitudController.getSolicitudes);

// Obtener las solicitudes del profesor autenticado (Ruta específica indispensable)
// IMPORTANTE: Debe ir antes de /:id para evitar que "mis-solicitudes" sea capturado como un parámetro de ID
router.get('/mis-solicitudes', verificarToken, solicitudController.getMisSolicitudes);

// Obtener una solicitud específica por ID (Protegido por token y validación de propiedad)
router.get('/:id', verificarToken, solicitudController.getSolicitudById);

// Rutas de Creación, Modificación y Eliminación con validación estricta de pertenencia
router.post('/', verificarToken, uploadFields, solicitudController.createSolicitud);
router.put('/:id', verificarToken, uploadFields, solicitudController.updateSolicitud);
router.delete('/:id', verificarToken, solicitudController.deleteSolicitud);

module.exports = router;