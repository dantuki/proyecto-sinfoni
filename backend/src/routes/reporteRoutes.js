const express = require('express');
const router = express.express ? express.Router() : express.Router();
const reporteController = require('../controllers/reporteController');

// Rutas de exportación nativas ExcelJS para el Administrador
router.get('/convocatorias', reporteController.getReporteConvocatorias);
router.get('/sedes-demografia', reporteController.getReporteSedesDemografia);
router.get('/evaluadores', reporteController.getReporteEvaluadores);
router.get('/proyectos-titulos', reporteController.getReporteProyectosTitulos);

module.exports = router;