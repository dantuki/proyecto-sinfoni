const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const sedeRoutes = require('./routes/sedeRoutes'); // Importar rutas de sedes

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Probar la conexion directamente en la consola
db.query('SELECT 1')
    .then(() => console.log('Conexión exitosa'))
    .catch(err => console.error('Error', err));

// Rutas de los modulos
app.use('/api/sedes', sedeRoutes); // Enlazar el prefijo /api/sedes

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: "API de SINFONI corriendo correctamente",
        estado: "Operativo",
        entorno: process.env.NODE_ENV || 'desarrollo'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Servidor SINFONI ejecutándose en el puerto ${PORT}`);
    console.log(`Enlace local: http://localhost:${PORT}`);
    console.log(`==================================================`);
});