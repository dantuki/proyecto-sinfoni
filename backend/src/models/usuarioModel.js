const db = require('../config/db');

const Usuario = {
    getAll: async () => {
        // Agregados: telefono, direccion y foto_url
        const [rows] = await db.query('SELECT id, cedula, nombre_completo, email, rol, telefono, direccion, foto_url, created_at FROM usuarios');
        return rows;
    },
    getById: async (id) => {
        // Agregados: telefono, direccion y foto_url para que el Frontend pueda pintarlos
        const [rows] = await db.query('SELECT id, cedula, nombre_completo, email, rol, telefono, direccion, foto_url, created_at FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const [result] = await db.query(
            'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol, telefono, direccion, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [data.cedula, data.nombre_completo, data.email, data.password, data.rol || 'Profesor', data.telefono || null, data.direccion || null, data.foto_url || null]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        // CONSTRUCCIÓN DINÁMICA: Solo actualiza lo que venga en el objeto 'data'
        const fields = [];
        const values = [];
        
        // Lista de columnas permitidas en la base de datos
        const allowedFields = ['cedula', 'nombre_completo', 'email', 'password', 'rol', 'telefono', 'direccion', 'foto_url'];
        
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        }

        // Si no se envió ningún campo válido, no hace nada
        if (fields.length === 0) return 0; 

        // Agregamos el ID al final para la cláusula WHERE
        values.push(id); 

        const [result] = await db.query(
            `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
            values
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
    },
    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0];
    },
};

module.exports = Usuario;