const db = require('../config/db');

const Asignacion = {
    // 1. Obtener todas las asignaciones
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM asignacion_evaluaciones');
        return rows;
    },

    // 2. Obtener una asignación por su ID específico (Info)
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM asignacion_evaluaciones WHERE id = ?', [id]);
        return rows[0]; 
    },

    // 3. Crear una nueva asignación (estado_evaluacion toma 'Asignado' por defecto en el SQL)
    create: async (data) => {
        const { solicitud_id, evaluador_id } = data;
        const [result] = await db.query(
            'INSERT INTO asignacion_evaluaciones (solicitud_id, evaluador_id) VALUES (?, ?)',
            [solicitud_id, evaluador_id]
        );
        return result.insertId;
    },

    // 4. Actualizar puntaje, comentarios y actualizar estado a 'Finalizado' (Calificar)
    updateEvaluacion: async (id, data) => {
        const { puntaje, comentarios } = data;
        const [result] = await db.query(
            `UPDATE asignacion_evaluaciones 
             SET puntaje = ?, comentarios = ?, estado_evaluacion = 'Finalizado' 
             WHERE id = ?`,
            [puntaje, comentarios, id]
        );
        return result.affectedRows;
    },

    // 5. Eliminar una asignación
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM asignacion_evaluaciones WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Asignacion;