const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarioController');

router.get('/', ctrl.getUsuarios);
router.get('/:id', ctrl.getUsuarioById);
router.post('/registro', ctrl.registrarUsuario);
router.put('/:id', ctrl.updateUsuario);
router.delete('/:id', ctrl.deleteUsuario);
router.delete('/mantenimiento/purgar-todo', ctrl.limpiarTablaDesarrollo);

module.exports = router;