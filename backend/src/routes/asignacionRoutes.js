const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asignacionController');

router.post('/', ctrl.asignarEvaluador);
router.put('/:id/calificar', ctrl.calificar);

module.exports = router;