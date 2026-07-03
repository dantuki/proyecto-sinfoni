const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/noticiaController');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para los documentos adjuntos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Les ponemos un prefijo de documento mas marca de tiempo para evitar nombres duplicados
    cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Endpoints asignados al circuito de noticias personales
router.get('/usuario/:usuarioId', ctrl.getNoticiasUsuario);
router.post('/', upload.single('archivo'), ctrl.crearNoticia);
router.put('/:id', upload.single('archivo'), ctrl.actualizarNoticia);
router.delete('/:id', ctrl.eliminarNoticia);

module.exports = router;