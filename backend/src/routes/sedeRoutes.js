const express = require('express');
const router = express.Router();
const sedeController = require('../controllers/sedeController');

// Definir la ruta GET para listar sedes
router.get('/', sedeController.getSedes);

module.exports = router;