const db = require('../config/db');

const Usuario = {
    getAll: async () => {
        const [rows] = await db.query('SELECT id, cedula, nombre_completo, email, rol, created_at FROM usuarios');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT id, cedula, nombre_completo, email, rol, created_at FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const [result] = await db.query(
            'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol) VALUES (?, ?, ?, ?, ?)',
            [data.cedula, data.nombre_completo, data.email, data.password, data.rol || 'Profesor']
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const [result] = await db.query(
            'UPDATE usuarios SET cedula = ?, nombre_completo = ?, email = ?, rol = ? WHERE id = ?',
            [data.cedula, data.nombre_completo, data.email, data.rol, id]
        );
        return result.affectedRows;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.affectedRows;
    },
    truncate: async () => {
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE usuarios');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
    },
    getByCedula: async (cedula) => {
        const [rows] = await db.query('SELECT id FROM usuarios WHERE cedula = ?', [cedula]);
        return rows[0];
    }
};

module.exports = Usuario;