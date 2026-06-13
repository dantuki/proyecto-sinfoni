const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/', usuarioController.getUsuarios);             // GET general (Listar)
router.get('/:id', usuarioController.getUsuarioPerfil);     // GET específico (Info)
router.post('/registro', usuarioController.registrarUsuario); // POST (Agregar)
router.put('/:id', usuarioController.updateUsuario);        // PUT (Update)
router.delete('/:id', usuarioController.deleteUsuario);     // DELETE (Borrar)

module.exports = router;