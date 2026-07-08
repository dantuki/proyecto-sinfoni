const db = require('../config/db');

// 1. Obtener participaciones segmentadas por Rol
exports.getParticipaciones = async (req, res) => {
  try {
    // req.usuario es inyectado automáticamente por tu authMiddleware
    const { id: usuarioId, rol } = req.usuario; 

    let query = `
      SELECT part.*, 
             p.codigo AS codigo_proyecto, 
             p.titulo AS titulo_proyecto,
             u.nombre AS nombre_usuario,
             u.correo AS correo_usuario
      FROM participaciones part
      JOIN proyectos p ON part.proyecto_id = p.id
      JOIN usuarios u ON part.usuario_id = u.id
    `;
    
    const params = [];

    // Si no es administrador, restringimos la consulta a su propio ID de usuario
    if (rol !== 'Administrador' && rol !== 'Admin') {
      query += ` WHERE part.usuario_id = ?`;
      params.push(usuarioId);
    }

    const [results] = await db.query(query, params);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error en getParticipaciones:', err);
    res.status(500).json({ error: 'Error interno de SINFONI al obtener las vinculaciones.' });
  }
};

// 2. Crear una nueva vinculación de investigador (Acción de Admin)
exports.crearVinculacion = async (req, res) => {
  const { proyecto_id, usuario_id, rol_proyecto, horas_dedicacion, fecha_vinculacion, estado_vinculacion } = req.body;

  if (!proyecto_id || !usuario_id || !rol_proyecto || !horas_dedicacion || !fecha_vinculacion) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
  }

  try {
    const query = `
      INSERT INTO participaciones (proyecto_id, usuario_id, rol_proyecto, horas_dedicacion, fecha_vinculacion, estado_vinculacion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valores = [
      proyecto_id, 
      usuario_id, 
      rol_proyecto, 
      horas_dedicacion, 
      fecha_vinculacion, 
      estado_vinculacion || 'Activo'
    ];

    const [result] = await db.query(query, valores);
    res.status(201).json({
      success: true,
      message: '¡Investigador vinculado con éxito al proyecto de investigación!',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error en crearVinculacion:', err);
    res.status(500).json({ error: 'Error de consistencia al insertar la vinculación en MySQL.' });
  }
};