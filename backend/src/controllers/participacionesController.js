const db = require('../config/db');

// 1. Obtener listado de participaciones (Filtrado por usuario si es Docente)
exports.getParticipaciones = async (req, res) => {
  try {
    const usuarioLogueado = req.usuario || req.user; 
    if (!usuarioLogueado) {
      return res.status(401).json({ error: 'No se encontraron las credenciales del usuario.' });
    }

    const usuarioId = usuarioLogueado.id || usuarioLogueado.usuarioId || usuarioLogueado.id_usuario;
    const rol = usuarioLogueado.rol;

    let query = `
      SELECT part.*, 
             part.archivo_url AS soporte_url,
             p.codigo AS codigo_proyecto, 
             p.titulo AS titulo_proyecto,
             u.nombre_completo AS nombre_usuario,
             u.email AS correo_usuario
      FROM participaciones part
      JOIN proyectos p ON part.proyecto_id = p.id
      JOIN usuarios u ON part.usuario_id = u.id
    `;
    
    const params = [];
    if (rol !== 'Admin' && rol !== 'Administrador') {
      query += ` WHERE part.usuario_id = ?`;
      params.push(usuarioId);
    }

    const [results] = await db.query(query, params);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('❌ Error en getParticipaciones:', err);
    res.status(500).json({ error: 'Error interno al consultar las vinculaciones.' });
  }
};

// 2. Crear vinculación directa (Admin) o enviar postulación con PDF (Docente)
exports.crearVinculacion = async (req, res) => {
  try {
    const usuarioLogueado = req.usuario || req.user;
    if (!usuarioLogueado) {
      return res.status(401).json({ error: 'Operación no autorizada.' });
    }

    const rol = usuarioLogueado.rol;
    const currentUserId = usuarioLogueado.id || usuarioLogueado.usuarioId || usuarioLogueado.id_usuario;

    const { proyecto_id, usuario_id, rol_proyecto, horas_dedicacion, fecha_vinculacion } = req.body;

    if (!proyecto_id || !rol_proyecto || !horas_dedicacion || !fecha_vinculacion) {
      return res.status(400).json({ error: 'Faltan parámetros críticos para procesar el registro.' });
    }

    const esAdmin = rol === 'Admin' || rol === 'Administrador';
    const finalUsuarioId = esAdmin ? usuario_id : currentUserId;
    const finalEstado = esAdmin ? 'Activo' : 'Pendiente';

    const archivo_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO participaciones (proyecto_id, usuario_id, rol_proyecto, horas_dedicacion, fecha_vinculacion, estado_vinculacion, archivo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const valores = [
      proyecto_id, 
      finalUsuarioId, 
      rol_proyecto, 
      horas_dedicacion, 
      fecha_vinculacion, 
      finalEstado,
      archivo_url
    ];

    const [result] = await db.query(query, valores);
    res.status(201).json({
      success: true,
      message: esAdmin ? '¡Investigador vinculado con éxito!' : '¡Tu postulación ha sido enviada al Administrador con éxito!',
      id: result.insertId
    });
  } catch (err) {
    console.error('❌ Error en crearVinculacion:', err);
    res.status(500).json({ error: 'Error de consistencia al guardar la vinculación.' });
  }
};

// 3. Modificar el estado de una vinculación (Soporta 'Aprobado', 'Rechazado', 'Activo', 'Inactivo')
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_vinculacion } = req.body;

    if (!estado_vinculacion) {
      return res.status(400).json({ error: 'El nuevo estado no fue especificado.' });
    }

    const query = `UPDATE participaciones SET estado_vinculacion = ? WHERE id = ?`;
    await db.query(query, [estado_vinculacion, id]);

    res.json({ success: true, message: `El estado se actualizó a de forma exitosa.` });
  } catch (err) {
    console.error('❌ Error en actualizarEstado:', err);
    res.status(500).json({ error: 'Error al cambiar el estado del registro en el servidor.' });
  }
};

// 4. Eliminar una vinculación o postulación de manera permanente
exports.eliminarParticipacion = async (req, res) => {
  try {
    const { id } = req.params;

    const [existe] = await db.query('SELECT * FROM participaciones WHERE id = ?', [id]);
    if (existe.length === 0) {
      return res.status(404).json({ error: 'La vinculación especificada no existe o ya fue eliminada.' });
    }

    const query = `DELETE FROM participaciones WHERE id = ?`;
    await db.query(query, [id]);

    res.json({ success: true, message: 'La vinculación fue removida del sistema correctamente.' });
  } catch (err) {
    console.error('❌ Error en eliminarParticipacion:', err);
    res.status(500).json({ error: 'Error interno al intentar eliminar el registro.' });
  }
};