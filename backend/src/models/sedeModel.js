const db = require('../config/db');

const Sede = {
    // 1. Consultar todas las sedes (Ya lo tenías)
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM sedes');
        return rows;
    },

    // 2. Info: Consultar una sede específica por su ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM sedes WHERE id = ?', [id]);
        return rows[0]; // Retorna la sede encontrada o undefined
    },

    // 3. Agregar: Insertar una nueva sede
    create: async (nombre_sede) => {
        const [result] = await db.query('INSERT INTO sedes (nombre_sede) VALUES (?)', [nombre_sede]);
        return result.insertId; // Retorna el ID de la nueva sede creada
    },

    // 4. Update: Modificar el nombre de una sede existente
    update: async (id, nombre_sede) => {
        const [result] = await db.query('UPDATE sedes SET nombre_sede = ? WHERE id = ?', [nombre_sede, id]);
        return result.affectedRows; // Retorna cuántas filas se actualizaron
    },

    // 5. Delete: Eliminar una sede por su ID (CORREGIDO)
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM sedes WHERE id = ?', [id]);
        return result.affectedRows; // Retorna cuántas filas se eliminaron
    }
};

module.exports = Sede;