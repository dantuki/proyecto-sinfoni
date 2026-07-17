const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const http = require('http'); // Servidor HTTP nativo requerido para WebSockets
const { Server } = require('socket.io'); // Instancia del servidor de Socket.io
const Usuario = require('./models/usuarioModel'); // Modelo para consultar contactos

// IMPORTACIÓN DE RUTAS (ArchiveX Limpio)
const SedeRoutes = require('./routes/sedeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const convocatoriaRoutes = require('./routes/convocatoriaRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const authRoutes = require('./routes/authRoutes'); 
const noticiaRoutes = require('./routes/noticiaRoutes'); 
const postulacionRoutes = require('./routes/postulacionRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Servir la carpeta de archivos PDFs almacenados de forma estática
app.use('/uploads', express.static('uploads'));

// Crear Servidor HTTP acoplado con Express
const server = http.createServer(app);

// Inicializar Servidor Socket.io con configuración CORS abierta para desarrollo
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Verificación y Creación Automática de la Tabla de Chat en la Base de Datos
const inicializarTablaChat = async () => {
  const queryTabla = `
    CREATE TABLE IF NOT EXISTS chat_mensajes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      remitente_id INT NOT NULL,
      destinatario_id INT NOT NULL,
      mensaje TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    await db.query(queryTabla);
    console.log('Tabla "chat_mensajes" verificada/creada con éxito.');
  } catch (error) {
    console.error('Error al inicializar la tabla de chat:', error);
  }
};

db.query('SELECT 1')
  .then(() => {
    console.log('Conexión exitosa con el motor MySQL');
    inicializarTablaChat();
  })
  .catch(err => console.error('Error en la base de datos:', err));

// MONTAJE DE RUTAS 
app.use('/api/sedes', SedeRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/convocatorias', convocatoriaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/asignacion', asignacionRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/api/noticias', noticiaRoutes); 
app.use('/api/postulaciones', postulacionRoutes);

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
  res.json({ mensaje: "API de ArchiveX operativa con WebSockets", estado: "Limpio" });
});

// --- LÓGICA DE WEBSOCKETS (SOCKET.IO) ---
const usuariosActivos = new Map(); // Mapa para emparejar userId -> socket.id

io.on('connection', (socket) => {
  console.log(`Usuario conectado al WebSocket: ${socket.id}`);

  // 1. Registro del usuario al conectar al sistema
  socket.on('registrar_usuario', (userId) => {
    if (userId) {
      usuariosActivos.set(String(userId), socket.id);
      console.log(`Usuario ID ${userId} registrado activamente en el socket ${socket.id}`);
    }
  });

  // 2. Obtener lista de contactos según el Rol correspondiente
  socket.on('obtener_contactos', async (rolUsuario) => {
    try {
      const contactos = await Usuario.getChatContacts(rolUsuario);
      socket.emit('lista_contactos', contactos);
    } catch (error) {
      socket.emit('error_chat', 'No se pudo cargar la lista de contactos.');
    }
  });

  // 3. Obtener el historial de mensajes entre dos usuarios particulares
  socket.on('obtener_historial', async ({ remitente_id, destinatario_id }) => {
    try {
      const [mensajes] = await db.query(
        `SELECT id, remitente_id, destinatario_id, mensaje, created_at 
         FROM chat_mensajes 
         WHERE (remitente_id = ? AND destinatario_id = ?) 
            OR (remitente_id = ? AND destinatario_id = ?) 
         ORDER BY created_at ASC`,
        [remitente_id, destinatario_id, destinatario_id, remitente_id]
      );
      socket.emit('historial_mensajes', mensajes);
    } catch (error) {
      socket.emit('error_chat', 'No se pudo recuperar el historial de chat.');
    }
  });

  // 4. Enviar e interceptar mensaje en tiempo real
  socket.on('enviar_mensaje', async ({ remitente_id, destinatario_id, mensaje }) => {
    if (!mensaje || !mensaje.trim()) return;

    try {
      // Guardar mensaje de manera persistente en la BD
      const [result] = await db.query(
        'INSERT INTO chat_mensajes (remitente_id, destinatario_id, mensaje) VALUES (?, ?, ?)',
        [remitente_id, destinatario_id, mensaje.trim()]
      );

      const nuevoMensaje = {
        id: result.insertId,
        remitente_id,
        destinatario_id,
        mensaje: mensaje.trim(),
        created_at: new Date()
      };

      // Emitir confirmación inmediata al propio emisor
      socket.emit('recibir_mensaje', nuevoMensaje);

      // Verificar si el destinatario está conectado en tiempo real para despacharle el mensaje
      const socketDestinatarioId = usuariosActivos.get(String(destinatario_id));
      if (socketDestinatarioId) {
        io.to(socketDestinatarioId).emit('recibir_mensaje', nuevoMensaje);
      }
    } catch (error) {
      socket.emit('error_chat', 'El mensaje no pudo ser transmitido ni guardado.');
    }
  });

  // Limpieza del mapa al desconectarse el cliente
  socket.on('disconnect', () => {
    for (const [userId, socketId] of usuariosActivos.entries()) {
      if (socketId === socket.id) {
        usuariosActivos.delete(userId);
        console.log(`Usuario ID ${userId} removido de las conexiones activas.`);
        break;
      }
    }
    console.log(`Conexión cerrada para el socket: ${socket.id}`);
  });
});

// IMPORTANTE: Cambiamos app.listen por server.listen para activar los WebSockets
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor ArchiveX híbrido (HTTP + WebSockets) corriendo en puerto ${PORT}`);
});