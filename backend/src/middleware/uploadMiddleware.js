const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, 'uploads/'); 
},
filename: function (req, file, cb) {
// Agrega la fecha actual al nombre original para que sea único
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
cb(null, uniqueSuffix + path.extname(file.originalname));
}
});

const fileFilter = (req, file, cb) => {
if (file.mimetype === 'application/pdf') {
cb(null, true);
} else {
cb(new Error('Formato no válido. Solo se permiten archivos PDF.'));
}
};

const upload = multer({ 
storage: storage,
fileFilter: fileFilter,
limits: { fileSize: 5 * 1024 * 1024 } // Límite máximo de 5MB por archivo
});

module.exports = upload;