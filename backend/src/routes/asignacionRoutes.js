const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asignacionController');
const upload = require('../middleware/uploadMiddleware'); // Singular 'middleware' corregido

router.get('/', ctrl.getAsignaciones);                                 // GET general (Listar todas)
router.get('/todas', ctrl.getAsignaciones);                            // GET todas (NUEVO: Soporte para el endpoint del frontend del Admin)
router.get('/evaluador/:evaluadorId', ctrl.getAsignacionesByEvaluador); // GET específico de un evaluador
router.get('/:id', ctrl.getAsignacionById);                        // GET específico por ID
router.post('/', ctrl.asignarEvaluador);                           // POST (Agregar / Crear asignación)

// PUT: Captura el PDF en 'archivo_evaluacion' utilizando el middleware optimizado
router.put('/:id/calificar', upload.single('archivo_evaluacion'), ctrl.calificar);                      

router.delete('/:id', ctrl.deleteAsignacion);                      // DELETE (Borrar asignación)

module.exports = router;