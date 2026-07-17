const db = require('../config/db');

const Usuario = {
  getAll: async () => {
    const [rows] = await db.query(
      'SELECT id, cedula, nombre_completo, email, rol, telefono, direccion, foto_url, nivel_educativo, carrera_titulo, certificado_url, fecha_nacimiento, created_at FROM usuarios'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, cedula, nombre_completo, email, rol, telefono, direccion, foto_url, nivel_educativo, carrera_titulo, certificado_url, fecha_nacimiento, created_at FROM usuarios WHERE id = ?', 
      [id]
    );
    return rows[0];
  },

  // Obtiene únicamente los usuarios cuyo rol sea 'Evaluador'
  getEvaluadores: async () => {
    const [rows] = await db.query(
      "SELECT id, cedula, nombre_completo, email, rol, telefono, direccion, foto_url, nivel_educativo, carrera_titulo, certificado_url, fecha_nacimiento, created_at FROM usuarios WHERE LOWER(rol) = 'evaluador'"
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol, telefono, direccion, foto_url, nivel_educativo, carrera_titulo, certificado_url, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.cedula, data.nombre_completo, data.email, data.password, data.rol || 'Profesor', 
        data.telefono || null, data.direccion || null, data.foto_url || null,
        data.nivel_educativo || null, data.carrera_titulo || null, data.certificado_url || null,
        data.fecha_nacimiento || null
      ]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'cedula', 'nombre_completo', 'email', 'password', 'rol', 
      'telefono', 'direccion', 'foto_url', 'nivel_educativo', 
      'carrera_titulo', 'certificado_url', 'fecha_nacimiento'
    ];
    
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key] === '' ? null : data[key]);
      }
    }

    if (fields.length === 0) return 0; 
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
  }
};

module.exports = Usuario;