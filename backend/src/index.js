const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// IMPORTACIÓN DE RUTAS (SINFONI Limpio)
const SedeRoutes = require('./routes/sedeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const convocatoriaRoutes = require('./routes/convocatoriaRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const authRoutes = require('./routes/authRoutes'); 
const noticiaRoutes = require('./routes/noticiaRoutes'); 
// CORREGIDO: 'postulacionRoutes' en singular para coincidir exactamente con tu archivo físico
const postulacionRoutes = require('./routes/postulacionRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Servir la carpeta de archivos PDFs almacenados de forma estática
app.use('/uploads', express.static('uploads'));

db.query('SELECT 1')
  .then(() => console.log('Conexión exitosa con el motor MySQL'))
  .catch(err => console.error('Error en la base de datos:', err));

// MONTAJE DE RUTAS 
app.use('/api/sedes', SedeRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/convocatorias', convocatoriaRoutes);
app.use('/api/solicitudes', solicitudRoutes);

// SOLUCIÓN: Soportamos tanto plural como singular para evitar conflictos de rutas
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/asignacion', asignacionRoutes); 

app.use('/api/auth', authRoutes); 
app.use('/api/noticias', noticiaRoutes); 
app.use('/api/postulaciones', postulacionRoutes); // <-- Registrado con éxito

// Manejador global para errores capturados en Express para evitar caídas
app.use((err, req, res, next) => {
  console.error("Error capturado globalmente:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
    details: err.sqlMessage || err.message || null
  });
});

app.get('/', (req, res) => {
  res.json({ mensaje: "API de SINFONI operativa", estado: "Limpio" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor SINFONI corriendo en puerto ${PORT}`);
});