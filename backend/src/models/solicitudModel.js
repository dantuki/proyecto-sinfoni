const db = require('../config/db');

const Solicitud = {
  getAll: async () => {
    const query = `
      SELECT s.id, s.num_solicitud, s.titulo_propuesta, s.observaciones, s.estado, s.motivo_decision, 
             s.presupuesto_url, s.cronograma_url, s.honestidad_url, s.id_url, s.doc_par_1, s.doc_par_2, s.created_at,
             u.nombre_completo AS profesor,
             c.titulo AS convocatoria,
             se.nombre_sede AS sede
      FROM solicitudes s
      JOIN usuarios u ON s.usuario_id = u.id
      JOIN convocatorias c ON s.convocatoria_id = c.id
      JOIN sedes se ON s.sede_id = se.id
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getById: async (id) => {
    const query = `
      SELECT s.id, s.usuario_id, s.convocatoria_id, s.sede_id, s.num_solicitud, s.titulo_propuesta, s.observaciones, s.estado, s.motivo_decision, 
             s.presupuesto_url, s.cronograma_url, s.honestidad_url, s.id_url, s.doc_par_1, s.doc_par_2, s.created_at,
             u.nombre_completo AS profesor,
             c.titulo AS convocatoria,
             se.nombre_sede AS sede
      FROM solicitudes s
      JOIN usuarios u ON s.usuario_id = u.id
      JOIN convocatorias c ON s.convocatoria_id = c.id
      JOIN sedes se ON s.sede_id = se.id
      WHERE s.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  getByUserId: async (usuarioId) => {
    const query = `
      SELECT s.id, s.num_solicitud, s.titulo_propuesta, s.observaciones, s.estado, s.motivo_decision, 
             s.presupuesto_url, s.cronograma_url, s.honestidad_url, s.id_url, s.doc_par_1, s.doc_par_2, s.created_at,
             c.titulo AS convocatoria,
             se.nombre_sede AS sede
      FROM solicitudes s
      JOIN convocatorias c ON s.convocatoria_id = c.id
      JOIN sedes se ON s.sede_id = se.id
      WHERE s.usuario_id = ?
      ORDER BY s.created_at DESC
    `;
    const [rows] = await db.query(query, [usuarioId]);
    return rows;
  },

  create: async (data) => {
    const { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta, 
      observaciones, 
      estado, 
      presupuesto_url, 
      cronograma_url, 
      honestidad_url, 
      id_url 
    } = data;

    const [result] = await db.query(
      `INSERT INTO solicitudes 
       (usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, presupuesto_url, cronograma_url, honestidad_url, id_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones || null, estado || 'Borrador', presupuesto_url || null, cronograma_url || null, honestidad_url || null, id_url || null]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta, 
      observaciones, 
      estado, 
      motivo_decision, 
      doc_par_1, 
      doc_par_2, 
      presupuesto_url, 
      cronograma_url, 
      honestidad_url, 
      id_url 
    } = data;

    const [result] = await db.query(
      `UPDATE solicitudes SET 
       usuario_id = ?, convocatoria_id = ?, sede_id = ?, num_solicitud = ?, titulo_propuesta = ?, observaciones = ?, estado = ?, motivo_decision = ?, doc_par_1 = ?, doc_par_2 = ?, presupuesto_url = ?, cronograma_url = ?, honestidad_url = ?, id_url = ? 
       WHERE id = ?`,
      [usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones || null, estado, motivo_decision || null, doc_par_1 || null, doc_par_2 || null, presupuesto_url, cronograma_url, honestidad_url, id_url, id]
    );
    return result.affectedRows;
  },

  updateEstado: async (id, estado, motivo_decision) => {
    const [result] = await db.query(
      `UPDATE solicitudes SET estado = ?, motivo_decision = ? WHERE id = ?`,
      [estado, motivo_decision || null, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM solicitudes WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Solicitud;