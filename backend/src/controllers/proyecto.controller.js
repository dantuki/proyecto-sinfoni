const db = require('../config/db'); // Tu conexión a MySQL con promesas

// NUEVA VISTA: Obtener TODOS los proyectos (Exclusivo para Admin)
const obtenerTodosLosProyectos = async (req, res) => {
  const { estado } = req.query; // Captura el filtro de Sinfoni (Activo, Liquidado, etc.)

  let sql = 'SELECT * FROM proyectos';
  const params = [];

  // Si el Admin filtra por un estado específico
  if (estado && estado !== '') {
    sql += ' WHERE estado = ?';
    params.push(estado);
  }

  try {
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en obtenerTodosLosProyectos:', error);
    res.status(500).json({ error: 'Error interno al obtener el portafolio global de proyectos.' });
  }
};

// Vista 1: Mis Proyectos (Donde el profesor es el Director/Investigador Principal)
const obtenerMisProyectos = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.query;

  let sql = 'SELECT * FROM proyectos WHERE director_id = ?';
  const params = [id];

  if (estado && estado !== '') {
    sql += ' AND estado = ?';
    params.push(estado);
  }

  try {
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
  obtenerTodosLosProyectos, // 👈 Exportamos la nueva función
  obtenerMisProyectos,
  obtenerMisParticipaciones
};