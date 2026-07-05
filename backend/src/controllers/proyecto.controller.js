const db = require('../config/db'); // Tu conexión a MySQL con promesas

// Vista 1: Mis Proyectos (Donde el profesor es el Director/Investigador Principal)
const obtenerMisProyectos = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.query; // Captura el filtro de Sinfoni (Activo, Liquidado, etc.)

  let sql = 'SELECT * FROM proyectos WHERE director_id = ?';
  const params = [id];

  // Si el usuario selecciona un filtro de estado específico en el frontend
  if (estado && estado !== '') {
    sql += ' AND estado = ?';
    params.push(estado);
  }

  try {
    // Si tu db usa pool clásico de promesas [rows], lo dejamos destructurado
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en obtenerMisProyectos:', error);
    res.status(500).json({ error: 'Error interno al obtener tus proyectos principales.' });
  }
};

// Vista 2: Mis Participaciones (Donde es Co-Investigador o colaborador)
const obtenerMisParticipaciones = async (req, res) => {
  const { id } = req.params;

  // Hacemos un JOIN para traer los datos del proyecto junto al rol que cumple el usuario
  const sql = `
    SELECT p.id, p.codigo, p.titulo, p.fecha_inicio, p.fecha_fin, p.estado, pp.rol_participacion
    FROM proyectos_participantes pp
    INNER JOIN proyectos p ON pp.proyecto_id = p.id
    WHERE pp.usuario_id = ?
  `;

  try {
    const [rows] = await db.query(sql, [id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en obtenerMisParticipaciones:', error);
    res.status(500).json({ error: 'Error interno al obtener tus colaboraciones.' });
  }
};

module.exports = {
  obtenerMisProyectos,
  obtenerMisParticipaciones
};