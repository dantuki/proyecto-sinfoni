const db = require('../config/db');

// 1. Obtener participaciones segmentadas por Rol
exports.getParticipaciones = async (req, res) => {
  try {
    // Protección contra undefined en el middleware
    const usuarioLogueado = req.usuario || req.user; 

    if (!usuarioLogueado) {
      console.log('⚠️ [SINFONI DEBUG]: No se detectó la sesión del usuario.');
      return res.status(401).json({ error: 'No se encontraron las credenciales del usuario.' });
    }

    // Extraemos el id y el rol mapeados del token
    const usuarioId = usuarioLogueado.id || usuarioLogueado.usuarioId || usuarioLogueado.id_usuario;
    const rol = usuarioLogueado.rol;

    // Consulta adaptada al 100% a tu script SQL real
    let query = `
      SELECT part.*, 
             p.codigo AS codigo_proyecto, 
             p.titulo AS titulo_proyecto,
             u.nombre_completo AS nombre_usuario,
             u.email AS correo_usuario
      FROM participaciones part
      JOIN proyectos p ON part.proyecto_id = p.id
      JOIN usuarios u ON part.usuario_id = u.id
    `;
    
    const params = [];

    // Según tu SQL, el rol es estrictamente 'Admin'
    if (rol !== 'Admin') {
      query += ` WHERE part.usuario_id = ?`;
      params.push(usuarioId);
    }

    const [results] = await db.query(query, params);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('❌ Error en getParticipaciones:', err);
    res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
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
      message: '¡Investigador vinculado con éxito al proyecto!',
      id: result.insertId
    });
  } catch (err) {
    console.error('❌ Error en crearVinculacion:', err);
    res.status(500).json({ error: 'Error de consistencia al insertar en la base de datos.' });
  }
};