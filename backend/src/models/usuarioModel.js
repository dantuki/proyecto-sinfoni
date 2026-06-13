const db = require('../config/db');

const Usuario = {
    // 1. GET: Consultar todos los usuarios registrados
    getAll: async () => {
        const [rows] = await db.query('SELECT id, cedula, nombre_completo, email, rol, created_at FROM usuarios');
        return rows;
    },

    // 2. INFO: Obtener un usuario por su ID (Ya lo tenías)
    getById: async (id) => {
        const [rows] = await db.query('SELECT id, cedula, nombre_completo, email, rol, created_at FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    },

    // 3. ADD: Registrar un nuevo usuario (Ya lo tenías)
    create: async (usuarioData) => {
        const { cedula, nombre_completo, email, password, rol } = usuarioData;
        const [result] = await db.query(
            'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol) VALUES (?, ?, ?, ?, ?)',
            [cedula, nombre_completo, email, password, rol || 'Profesor']
        );
        return result.insertId;
    },

    // 4. UPDATE: Modificar los datos de un usuario existente
    update: async (id, usuarioData) => {
        const { cedula, nombre_completo, email, rol } = usuarioData;
        const [result] = await db.query(
            'UPDATE usuarios SET cedula = ?, nombre_completo = ?, email = ?, rol = ? WHERE id = ?',
            [cedula, nombre_completo, email, rol, id]
        );
        return result.affectedRows; // Retorna cuántas filas se actualizaron
    },

    // 5. DELETE: Eliminar un usuario por su ID
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.affectedRows; // Retorna cuántas filas se eliminaron
    },

    // Métodos de apoyo para validaciones
    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0];
    },
    getByCedula: async (cedula) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula]);
        return rows[0];
    }
};

module.exports = Usuario;