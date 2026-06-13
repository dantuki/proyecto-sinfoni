const db = require('../config/db');

const Asignacion = {
    // Asignar una solicitud a un evaluador
    create: async (data) => {
        const { solicitud_id, evaluador_id } = data;
        const [result] = await db.query(
            'INSERT INTO asignacion_evaluaciones (solicitud_id, evaluador_id) VALUES (?, ?)',
            [solicitud_id, evaluador_id]
        );
        return result.insertId;
    },
    // Obtener asignaciones por evaluador
    getByEvaluador: async (evaluador_id) => {
        const [rows] = await db.query('SELECT * FROM asignacion_evaluaciones WHERE evaluador_id = ?', [evaluador_id]);
        return rows;
    },
    // Registrar el puntaje y comentarios
    updateEvaluacion: async (id, data) => {
        const { puntaje, comentarios } = data;
        const [result] = await db.query(
            'UPDATE asignacion_evaluaciones SET puntaje = ?, comentarios = ? WHERE id = ?',
            [puntaje, comentarios, id]
        );
        return result.affectedRows;
    }
};

module.exports = Asignacion;