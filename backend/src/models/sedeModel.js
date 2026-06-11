const db = require('../config/db');

const Sede = {
    // Consultar todas las sedes registradas en la base de datos
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM sedes');
        return rows;
    }
};

module.exports = Sede;