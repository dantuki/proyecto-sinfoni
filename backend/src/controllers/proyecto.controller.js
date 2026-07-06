const db = require('../config/db'); // Conexión a MySQL con promesas

// Vista global: Obtener todos los proyectos (Exclusivo para Admin)
const obtenerTodosLosProyectos = async (req, res) => {
  const { estado } = req.query;
  let sql = 'SELECT * FROM proyectos';
  const params = [];

  if (estado && estado !== '') {
    sql += ' WHERE estado = ?';
    params.push(estado);
  }

  try {
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en obtenerTodosLosProyectos:', error);
    res.status(500).json({ error: 'Error al obtener el portafolio global.' });
  }
};

// Vista 1: Mis Proyectos (Profesor como Director/Investigador Principal)
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
    res.status(500).json({ error: 'Error al obtener tus proyectos principales.' });
  }
};

// Vista 2: Mis Participaciones (Profesor como Co-Investigador o colaborador)
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
    res.status(500).json({ error: 'Error al obtener tus colaboraciones.' });
  }
};

// Acción: Crear un nuevo proyecto en la BD
const crearProyecto = async (req, res) => {
  const { codigo, titulo, fecha_inicio, fecha_fin, estado, director_id } = req.body;

  if (!codigo || !titulo || !director_id) {
    return res.status(400).json({ error: 'Código, Título y Director son obligatorios.' });
  }

  const sql = `
    INSERT INTO proyectos (codigo, titulo, fecha_inicio, fecha_fin, estado, director_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [codigo, titulo, fecha_inicio || null, fecha_fin || null, estado || 'Activo', director_id];

  try {
    const [result] = await db.query(sql, params);
    res.json({ success: true, message: 'Proyecto registrado con éxito', insertId: result.insertId });
  } catch (error) {
    console.error('Error en crearProyecto:', error);
    res.status(500).json({ error: 'Error al guardar el proyecto en la base de datos.' });
  }
};

module.exports = {
  obtenerTodosLosProyectos,
  obtenerMisProyectos,
  obtenerMisParticipaciones,
  crearProyecto
};