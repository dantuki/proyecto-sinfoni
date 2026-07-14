const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// IMPORTACIÓN DE RUTAS (SINFONI Limpio)
const sedeRoutes = require('./routes/sedeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const convocatoriaRoutes = require('./routes/convocatoriaRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const authRoutes = require('./routes/authRoutes'); 
const noticiaRoutes = require('./routes/noticiaRoutes'); 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

db.query('SELECT 1')
  .then(() => console.log('Conexión exitosa con el motor MySQL'))
  .catch(err => console.error('Error en la base de datos:', err));

// MONTAJE DE RUTAS (Se eliminaron Proyectos y Participaciones)
app.use('/api/sedes', sedeRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/convocatorias', convocatoriaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/noticias', noticiaRoutes); 

app.get('/', (req, res) => {
  res.json({ mensaje: "API de SINFONI operativa", estado: "Limpio" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor SINFONI corriendo en puerto ${PORT}`);
});