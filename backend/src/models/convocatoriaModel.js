const db = require('../config/db');

const Convocatoria = {
    // 1. GET: Obtener todas las convocatorias
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM convocatorias');
        return rows;
    },

    // 2. INFO: Obtener una convocatoria específica por ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM convocatorias WHERE id = ?', [id]);
        return rows[0];
    },

    // 3. ADD: Crear una nueva convocatoria
    create: async (data) => {
        const { titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = data;
        const [result] = await db.query(
            'INSERT INTO convocatorias (titulo, tipo, fecha_inicio, fecha_cierre, bases_url) VALUES (?, ?, ?, ?, ?)',
            [titulo, tipo, fecha_inicio, fecha_cierre, bases_url || null]
        );
        return result.insertId;
    },

    // 4. UPDATE: Modificar una convocatoria existente
    update: async (id, data) => {
        const { titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = data;
        const [result] = await db.query(
            'UPDATE convocatorias SET titulo = ?, tipo = ?, fecha_inicio = ?, fecha_cierre = ?, bases_url = ? WHERE id = ?',
            [titulo, tipo, fecha_inicio, fecha_cierre, bases_url, id]
        );
        return result.affectedRows;
    },

    // 5. DELETE: Eliminar una convocatoria por ID
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM convocatorias WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Convocatoria;