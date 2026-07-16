const db = require('../config/db');

const Asignacion = {
    // 1. Obtener todas las asignaciones con detalles de solicitud y evaluador
    getAll: async () => {
        const query = `
            SELECT 
                ae.id,
                ae.solicitud_id,
                ae.evaluador_id,
                ae.puntaje,
                ae.comentarios,
                ae.estado_evaluacion,
                ae.fecha_asignacion,
                s.codigoPropuesta,
                s.titulo_propuesta,
                s.estado AS estado_solicitud,
                u.nombre AS evaluador_nombre,
                u.correo AS evaluador_correo
            FROM asignacion_evaluaciones ae
            INNER JOIN solicitudes s ON ae.solicitud_id = s.id
            INNER JOIN usuarios u ON ae.evaluador_id = u.id
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // 2. Obtener una asignación específica por ID
    getById: async (id) => {
        const query = `
            SELECT 
                ae.*,
                s.codigoPropuesta,
                s.titulo_propuesta,
                u.nombre AS evaluador_nombre
            FROM asignacion_evaluaciones ae
            INNER JOIN solicitudes s ON ae.solicitud_id = s.id
            INNER JOIN usuarios u ON ae.evaluador_id = u.id
            WHERE ae.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows[0]; 
    },

    // 3. Obtener asignaciones pendientes o realizadas por un evaluador específico
    getByEvaluadorId: async (evaluadorId) => {
        const query = `
            SELECT 
                ae.id AS asignacion_id,
                ae.solicitud_id,
                ae.puntaje,
                ae.comentarios,
                ae.estado_evaluacion,
                ae.fecha_asignacion,
                s.codigoPropuesta,
                s.titulo_propuesta,
                s.docente_nombre,
                s.presupuesto,
                s.cronograma,
                s.honestidad,
                s.id_documento,
                s.observaciones
            FROM asignacion_evaluaciones ae
            INNER JOIN solicitudes s ON ae.solicitud_id = s.id
            WHERE ae.evaluador_id = ?
        `;
        const [rows] = await db.query(query, [evaluadorId]);
        return rows;
    },

    // 4. Crear una nueva asignación y actualizar el estado de la propuesta a 'En Evaluación'
    create: async (data) => {
        const { solicitud_id, evaluador_id } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insertar asignación
            const [result] = await connection.query(
                'INSERT INTO asignacion_evaluaciones (solicitud_id, evaluador_id) VALUES (?, ?)',
                [solicitud_id, evaluador_id]
            );

            // Cambiar estado de la solicitud automáticamente a 'En Evaluación'
            await connection.query(
                "UPDATE solicitudes SET estado = 'En Evaluación' WHERE id = ?",
                [solicitud_id]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 5. Actualizar evaluación (Puntaje, Comentarios y colocar 'Finalizado')
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

    // 6. Eliminar una asignación
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM asignacion_evaluaciones WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Asignacion;