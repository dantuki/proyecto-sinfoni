const express = require('express');
const router = express.Router();
const postulacionController = require('../controllers/postulacionController');
const verificarToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/postulaciones';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos en formato PDF'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const cpUpload = upload.fields([
  { name: 'presupuesto', maxCount: 1 },
  { name: 'cronograma', maxCount: 1 },
  { name: 'honestidad', maxCount: 1 },
  { name: 'id', maxCount: 1 }
]);

// Rutas de uso para Docentes (Radicación e Historial)
router.post('/radicar', verificarToken, cpUpload, postulacionController.createPostulacion);
router.get('/mis-solicitudes', verificarToken, postulacionController.getPostulacionesByUser);

// Rutas Administrativas de SINFONI (Fase 4: Consola de Administración)
router.get('/', verificarToken, postulacionController.getPostulacionesAdmin);
router.put('/:id/estado', verificarToken, postulacionController.updateEstadoPostulacion);

module.exports = router;