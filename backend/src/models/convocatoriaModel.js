const db = require('../config/db');

const Convocatoria = {
getAll: async () => {
const [rows] = await db.query('SELECT * FROM convocatorias ORDER BY created_at DESC');
return rows;
},

getById: async (id) => {
const [rows] = await db.query('SELECT * FROM convocatorias WHERE id = ?', [id]);
return rows[0];
},

create: async (data) => {
const { codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad, area_tematica, bases_url, plantillas_url } = data;
const [result] = await db.query(
'INSERT INTO convocatorias (codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad, area_tematica, bases_url, plantillas_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
[codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max || null, modalidad || null, area_tematica || null, bases_url || null, plantillas_url || null]
);
return result.insertId;
},

update: async (id, data) => {
const { codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad, area_tematica, bases_url, plantillas_url } = data;
const [result] = await db.query(
'UPDATE convocatorias SET codigo = ?, titulo = ?, descripcion = ?, tipo = ?, fecha_inicio = ?, fecha_cierre = ?, presupuesto_max = ?, modalidad = ?, area_tematica = ?, bases_url = ?, plantillas_url = ? WHERE id = ?',
[codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad, area_tematica, bases_url, plantillas_url, id]
);
return result.affectedRows;
},

delete: async (id) => {
const [result] = await db.query('DELETE FROM convocatorias WHERE id = ?', [id]);
return result.affectedRows;
}
};

module.exports = Convocatoria;