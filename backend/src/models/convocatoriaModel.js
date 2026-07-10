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

    // Añadimos el campo código a la inserción
    create: async (data) => {
        const { codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = data;
        const [result] = await db.query(
            'INSERT INTO convocatorias (codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url || null]
        );
        return result.insertId;
    },

    // Permite actualizar todo, incluyendo la fecha de cierre (Extensión de tiempo)
    update: async (id, data) => {
        const { codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = data;
        const [result] = await db.query(
            'UPDATE convocatorias SET codigo = ?, titulo = ?, tipo = ?, fecha_inicio = ?, fecha_cierre = ?, bases_url = ? WHERE id = ?',
            [codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM convocatorias WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Convocatoria;