const express = require('express');
const router = express.Router();
const postulacionController = require('../controllers/postulacionController');
const verificarToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento para Multer
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

// Filtro para validar que solo se suban archivos PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos en formato PDF'), false);
  }
};

// Instancia de Multer con límites de tamaño (10MB por archivo)
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Definición de los cuatro campos de archivo esperados
const cpUpload = upload.fields([
  { name: 'presupuesto', maxCount: 1 },
  { name: 'cronograma', maxCount: 1 },
  { name: 'honestidad', maxCount: 1 },
  { name: 'identidad', maxCount: 1 } // Campo corregido para sincronizar con el frontend
]);

// Middleware intermedio para capturar y manejar errores de Multer elegantemente
const handleMulterUpload = (req, res, next) => {
  cpUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Uno de los archivos excede el límite de peso permitido (10MB).' 
        });
      }
      return res.status(400).json({ 
        status: 'error', 
        message: `Error de carga: ${err.message}` 
      });
    } else if (err) {
      return res.status(400).json({ 
        status: 'error', 
        message: err.message 
      });
    }
    next();
  });
};

// Middleware Premium de Autorización Flexible para Roles de Admin/Evaluadores
const exigirRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'No autorizado: Falta información de rol en la sesión.' 
      });
    }

    // Normalizar 'Admin' y 'Administrador' para evitar conflictos de escritura en DB
    const miRol = req.user.rol.toLowerCase() === 'admin' ? 'administrador' : req.user.rol.toLowerCase();
    const rolesMapeados = rolesPermitidos.map(r => r.toLowerCase() === 'admin' ? 'administrador' : r.toLowerCase());

    if (!rolesMapeados.includes(miRol)) {
      return res.status(403).json({ 
        status: 'error', 
        message: `Acceso denegado: El rol '${req.user.rol}' no tiene permisos para realizar esta acción.` 
      });
    }
    next();
  };
};

// --- Definición de Rutas ---

// Radicar una nueva postulación (Docente)
router.post('/radicar', verificarToken, handleMulterUpload, postulacionController.createPostulacion);

// Obtener historial de postulaciones del docente autenticado
router.get('/mis-solicitudes', verificarToken, postulacionController.getPostulacionesByUser);

// Obtener todas las postulaciones para la bandeja de administración (Admite tanto 'Admin' como 'Administrador' y 'Evaluador')
router.get('/', verificarToken, exigirRol('Admin', 'Administrador', 'Evaluador'), postulacionController.getPostulacionesAdmin);

// Actualizar el estado de evaluación de una postulación (Admite tanto 'Admin' como 'Administrador')
router.put('/:id/estado', verificarToken, exigirRol('Admin', 'Administrador'), postulacionController.updateEstadoPostulacion);

module.exports = router;