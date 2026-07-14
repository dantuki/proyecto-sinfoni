const db = require('../config/db');

const Solicitud = {
getAll: async () => {
const query = `
SELECT s.id, s.num_solicitud, s.titulo_propuesta, s.observaciones, s.estado, s.motivo_decision, s.doc_par_1, s.doc_par_2, s.created_at,
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
SELECT s.id, s.usuario_id, s.convocatoria_id, s.sede_id, s.num_solicitud, s.titulo_propuesta, s.observaciones, s.estado, s.motivo_decision, s.doc_par_1, s.doc_par_2, s.created_at,
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

create: async (data) => {
const { usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, doc_par_1, doc_par_2 } = data;
const [result] = await db.query(
'INSERT INTO solicitudes (usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, doc_par_1, doc_par_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
[usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones || null, estado || 'Borrador', doc_par_1 || null, doc_par_2 || null]
);
return result.insertId;
},

update: async (id, data) => {
const { usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, motivo_decision, doc_par_1, doc_par_2 } = data;
const [result] = await db.query(
'UPDATE solicitudes SET usuario_id = ?, convocatoria_id = ?, sede_id = ?, num_solicitud = ?, titulo_propuesta = ?, observaciones = ?, estado = ?, motivo_decision = ?, doc_par_1 = ?, doc_par_2 = ? WHERE id = ?',
[usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, motivo_decision || null, doc_par_1, doc_par_2, id]
);
return result.affectedRows;
},

delete: async (id) => {
const [result] = await db.query('DELETE FROM solicitudes WHERE id = ?', [id]);
return result.affectedRows;
}
};

module.exports = Solicitud;