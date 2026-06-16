const db = require('../config/db');

const Trazabilidad = {
    // Registrar un movimiento en el historial
    registrarCambio: async (data) => {
        const { solicitud_id, usuario_id, estado_anterior, estado_nuevo, motivo_cambio } = data;
        const [result] = await db.query(
            `INSERT INTO trazabilidad_solicitudes 
            (solicitud_id, usuario_id, estado_anterior, estado_nuevo, motivo_cambio) 
            VALUES (?, ?, ?, ?, ?)`,
            [solicitud_id, usuario_id, estado_anterior, estado_nuevo, motivo_cambio || null]
        );
        return result.insertId;
    },

    // Obtener el historial de una solicitud específica (por si lo piden los profes luego)
    obtenerPorSolicitud: async (solicitudId) => {
        const [rows] = await db.query(
            `SELECT t.*, u.nombre_completo as usuario_nombre 
             FROM trazabilidad_solicitudes t
             JOIN usuarios u ON t.usuario_id = u.id
             WHERE t.solicitud_id = ? 
             ORDER BY t.fecha_cambio DESC`, 
            [solicitudId]
        );
        return rows;
    }
};

module.exports = Trazabilidad;