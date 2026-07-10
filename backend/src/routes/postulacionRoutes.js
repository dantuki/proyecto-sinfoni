const express = require('express');
const router = express.Router();
const postulacionController = require('../controllers/postulacionController');
const verificarToken = require('../middleware/authMiddleware'); // Tu portero
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento local para los PDFs del profesor
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

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Definimos que esperamos exactamente estos 4 campos de archivos
const cpUpload = upload.fields([
    { name: 'presupuesto', maxCount: 1 },
    { name: 'cronograma', maxCount: 1 },
    { name: 'honestidad', maxCount: 1 },
    { name: 'id', maxCount: 1 }
]);

// Ruta protegida para que el profesor radique su propuesta
router.post('/radicar', verificarToken, cpUpload, postulacionController.createPostulacion);

// Ruta para que el profesor vea su propio historial de solicitudes
router.get('/mis-solicitudes', verificarToken, postulacionController.getPostulacionesByUser);

module.exports = router;