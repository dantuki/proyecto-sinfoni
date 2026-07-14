const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const verificarToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento local para los PDFs de las convocatorias
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Los archivos se guardarán en la carpeta raíz 'uploads' de tu backend
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'bases-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos en formato PDF'), false);
    }
  }
});

// Rutas Públicas
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);

// Rutas Protegidas (Soportando la carga física del PDF de términos)
router.post('/', verificarToken, upload.single('archivo_bases'), convocatoriaController.createConvocatoria);
router.put('/:id', verificarToken, upload.single('archivo_bases'), convocatoriaController.updateConvocatoria);
router.delete('/:id', verificarToken, convocatoriaController.deleteConvocatoria);

module.exports = router;