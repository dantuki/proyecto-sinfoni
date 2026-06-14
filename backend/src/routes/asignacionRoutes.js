const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asignacionController');

router.get('/', ctrl.getAsignaciones);          // GET general (Listar todas)
router.get('/:id', ctrl.getAsignacionById);     // GET específico (Info de una asignación)
router.post('/', ctrl.asignarEvaluador);        // POST (Agregar / Crear asignación)
router.put('/:id/calificar', ctrl.calificar);   // PUT (Calificar / Update específico)
router.delete('/:id', ctrl.deleteAsignacion);   // DELETE (Borrar asignación)

module.exports = router;