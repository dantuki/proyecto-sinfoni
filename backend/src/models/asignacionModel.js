const db = require('../config/db');

const Asignacion = {
  getAll: async () => {
    const query = `
      SELECT a.id AS asignacion_id, a.solicitud_id, a.evaluador_id, a.puntaje, a.comentarios, a.estado_evaluacion,
             s.num_solicitud AS codigoPropuesta, s.titulo_propuesta,
             u.nombre_completo AS docente_nombre
      FROM asignacion_evaluaciones a
      JOIN solicitudes s ON a.solicitud_id = s.id
      JOIN usuarios u ON s.usuario_id = u.id
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getById: async (id) => {
    const query = `
      SELECT a.id AS asignacion_id, a.solicitud_id, a.evaluador_id, a.puntaje, a.comentarios, a.estado_evaluacion,
             s.num_solicitud AS codigoPropuesta, s.titulo_propuesta,
             u.nombre_completo AS docente_nombre
      FROM asignacion_evaluaciones a
      JOIN solicitudes s ON a.solicitud_id = s.id
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE a.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  getByEvaluadorId: async (evaluadorId) => {
    const query = `
      SELECT a.id AS asignacion_id, a.solicitud_id, a.evaluador_id, a.puntaje, a.comentarios, a.estado_evaluacion,
             s.num_solicitud AS codigoPropuesta, s.titulo_propuesta,
             s.presupuesto_url AS presupuesto, s.cronograma_url AS cronograma, 
             s.honestidad_url AS honestidad, s.id_url AS id_documento,
             u.nombre_completo AS docente_nombre
      FROM asignacion_evaluaciones a
      JOIN solicitudes s ON a.solicitud_id = s.id
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE a.evaluador_id = ?
    `;
    const [rows] = await db.query(query, [evaluadorId]);
    return rows;
  },

  create: async (data) => {
    const { postulacionId, evaluadorId } = data;
    
    // Validamos si ya existe la asignación para evitar duplicados en la base de datos
    const [existente] = await db.query(
      'SELECT id FROM asignacion_evaluaciones WHERE solicitud_id = ? AND evaluador_id = ?',
      [postulacionId, evaluadorId]
    );

    if (existente.length > 0) {
      return existente[0].id;
    }

    const [result] = await db.query(
      `INSERT INTO asignacion_evaluaciones (solicitud_id, evaluador_id, estado_evaluacion) VALUES (?, ?, 'Asignado')`,
      [postulacionId, evaluadorId]
    );
    return result.insertId;
  },

  updateEvaluacion: async (id, data) => {
    const { puntaje, comentarios } = data;
    const [result] = await db.query(
      `UPDATE asignacion_evaluaciones SET puntaje = ?, comentarios = ?, estado_evaluacion = 'Finalizado' WHERE id = ?`,
      [puntaje, comentarios, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM asignacion_evaluaciones WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Asignacion;