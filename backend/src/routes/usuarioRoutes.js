const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuarioController');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento local de Multer para tus entornos de desarrollo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asegúrate de tener la carpeta 'uploads' creada en la raíz de tu proyecto
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Rutas base del módulo de usuarios
router.get('/', ctrl.getUsuarios);
router.get('/:id', ctrl.getUsuarioById);
router.post('/registro', ctrl.registrarUsuario);

// Interceptamos la subida de múltiples campos binarios aquí antes de pasar al controlador
router.put('/:id', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'certificado', maxCount: 1 }
]), ctrl.updateUsuario);

router.delete('/:id', ctrl.deleteUsuario);
router.delete('/mantenimiento/purgar-todo', ctrl.limpiarTablaDesarrollo);

module.exports = router;