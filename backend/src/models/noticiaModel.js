const db = require('../config/db'); // Asegúrate de que apunte correctamente a tu archivo de conexión

const Noticia = {
  getAllByUsuario: async (usuarioId) => {
    const [rows] = await db.query('SELECT * FROM noticias WHERE usuario_id = ? ORDER BY fecha DESC', [usuarioId]);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM noticias WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { usuario_id, titulo, contenido, archivo_url, fecha } = data;
    const [result] = await db.query(
      'INSERT INTO noticias (usuario_id, titulo, contenido, archivo_url, fecha) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, titulo, contenido, archivo_url, fecha]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { titulo, contenido, archivo_url, fecha } = data;
    await db.query(
      'UPDATE noticias SET titulo = ?, contenido = ?, archivo_url = ?, fecha = ? WHERE id = ?',
      [titulo, contenido, archivo_url, fecha, id]
    );
  },

  delete: async (id) => {
    await db.query('DELETE FROM noticias WHERE id = ?', [id]);
  }
};

module.exports = Noticia;