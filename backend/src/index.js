const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// IMPORTACIÓN DE RUTAS (Módulos del Sistema SINFONI)
const sedeRoutes = require('./routes/sedeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const convocatoriaRoutes = require('./routes/convocatoriaRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const authRoutes = require('./routes/authRoutes'); // Módulo de Autenticación

dotenv.config();
const app = express();

// MIDDLEWARES CORE
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// VERIFICACIÓN ASÍNCRONA DE CONEXIÓN CON MYSQL
db.query('SELECT 1')
  .then(() => console.log('Conexión exitosa con el motor MySQL'))
  .catch(err => console.error('Error en la base de datos:', err));

// MONTAJE DE LAS RUTAS DE LA API (Prefijos REST)
app.use('/api/sedes', sedeRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/convocatorias', convocatoriaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/auth', authRoutes); // Montaje del endpoint de Login

// RUTA DE CONFIGURACIÓN / PRUEBA DE DISPONIBILIDAD
app.get('/', (req, res) => {
  res.json({
    mensaje: "API de SINFONI corriendo correctamente",
    estado: "Operativo",
    entorno: process.env.NODE_ENV || 'desarrollo'
  });
});

// ESCUCHA DEL SERVIDOR LOCAL
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Servidor SINFONI ejecutándose en el puerto ${PORT}`);
  console.log(`Enlace local: http://localhost:${PORT}`);
  console.log(`==================================================`);
});