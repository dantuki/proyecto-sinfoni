const express = require('express');
const router = express.Router();
const participacionesController = require('../controllers/participacionesController');
const verificarToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Validar la existencia física del directorio de almacenamiento de soportes
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuración de almacenamiento local para los soportes PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `soporte-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro de seguridad para restringir archivos que no sean PDF
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Formato denegado. Solo se permiten archivos de extensión .pdf'));
    }
  }
});

// Definición de endpoints del módulo de participaciones
router.get('/', verificarToken, participacionesController.getParticipaciones);
router.post('/', verificarToken, upload.single('archivo'), participacionesController.crearVinculacion);
router.put('/:id', verificarToken, participacionesController.actualizarEstado);
router.delete('/:id', verificarToken, participacionesController.eliminarParticipacion);

module.exports = router;