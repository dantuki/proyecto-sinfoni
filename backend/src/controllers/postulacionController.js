const Solicitud = require('../models/solicitudModel');
const db = require('../config/db');

// 1. Radicar propuesta de investigación (Docente)
const createPostulacion = async (req, res) => {
  try {
    const { codigoPropuesta, titulo_propuesta, sede, convocatoriaId, observaciones } = req.body;
    const usuarioId = req.user?.id; 
    const archivos = req.files;

    if (!archivos || !archivos.presupuesto || !archivos.cronograma || !archivos.honestidad || !archivos.id) {
      return res.status(400).json({ 
        status: "error", 
        message: "Los 4 archivos PDF (Presupuesto, Cronograma, Declaración e Identificación) son obligatorios." 
      });
    }

    if (!codigoPropuesta || !titulo_propuesta || !sede || !convocatoriaId) {
      return res.status(400).json({ 
        status: "error", 
        message: "El código de propuesta, el título, la convocatoria y la sede son campos obligatorios." 
      });
    }

    const presupuesto_url = archivos.presupuesto[0].path.replace(/\\/g, '/');
    const cronograma_url = archivos.cronograma[0].path.replace(/\\/g, '/');
    const honestidad_url = archivos.honestidad[0].path.replace(/\\/g, '/');
    const id_url = archivos.id[0].path.replace(/\\/g, '/');

    const nuevaSolicitudId = await Solicitud.create({
      usuario_id: usuarioId,
      convocatoria_id: parseInt(convocatoriaId),
      sede_id: parseInt(sede),
      num_solicitud: codigoPropuesta,
      titulo_propuesta: titulo_propuesta,
      observaciones: observaciones || null,
      estado: 'Radicado', 
      presupuesto_url,
      cronograma_url,
      honestidad_url,
      id_url
    });

    res.status(201).json({
      status: "success",
      message: "Propuesta radicada exitosamente en la base de datos con sus 4 documentos.",
      data: {
        id: nuevaSolicitudId,
        codigoPropuesta,
        titulo_propuesta,
        usuarioId,
        archivos: {
          presupuesto_url,
          cronograma_url,
          honestidad_url,
          id_url
        }
      }
    });

  } catch (error) {
    console.error("Error al radicar postulación:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Error al procesar la radicación de la propuesta", 
      details: error.message 
    });
  }
};

// 2. Obtener historial del docente logueado
const getPostulacionesByUser = async (req, res) => {
  try {
    const usuarioId = req.user?.id; 
    const solicitudes = await Solicitud.getByUserId(usuarioId);

    res.status(200).json({ 
      status: "success", 
      data: solicitudes 
    });
  } catch (error) {
    console.error("Error al obtener solicitudes del usuario:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Error al obtener tus solicitudes", 
      details: error.message 
    });
  }
};

// 3. Obtener todas las propuestas para el panel de administración (Admin)
const getPostulacionesAdmin = async (req, res) => {
  try {
    // CORREGIDO: u.email en lugar de u.correo para coincidir con la estructura real de tu SQL
    const query = `
      SELECT 
        s.id,
        s.num_solicitud AS codigoPropuesta,
        s.titulo_propuesta,
        s.presupuesto_url AS presupuesto,
        s.cronograma_url AS cronograma,
        s.honestidad_url AS honestidad,
        s.id_url AS id_documento,
        s.estado,
        s.created_at AS fecha_radicacion,
        s.observaciones,
        s.sede_id AS sede,
        se.nombre_sede AS nombre_sede,
        u.nombre_completo AS docente_nombre,
        u.email AS docente_correo
      FROM solicitudes s
      LEFT JOIN sedes se ON s.sede_id = se.id
      LEFT JOIN usuarios u ON s.usuario_id = u.id
      ORDER BY s.id DESC
    `;

    const [rows] = await db.query(query);

    const cleanPath = (filePath) => {
      if (!filePath) return null;
      return filePath.startsWith('uploads/') ? filePath.replace('uploads/', '') : filePath;
    };

    const result = rows.map(row => ({
      ...row,
      presupuesto: cleanPath(row.presupuesto),
      cronograma: cleanPath(row.cronograma),
      honestidad: cleanPath(row.honestidad),
      id_documento: cleanPath(row.id_documento)
    }));

    res.status(200).json({
      status: "success",
      data: result
    });
  } catch (error) {
    console.error("Error al consultar solicitudes desde administración:", error);
    res.status(500).json({
      status: "error",
      message: "Error al cargar la bandeja de entrada para administradores.",
      details: error.message
    });
  }
};

// 4. Actualizar el estado de una propuesta (Admin)
const updateEstadoPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Borrador', 'Radicado', 'En Evaluación', 'Aprobado', 'Rechazado'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        status: "error",
        message: "El estado proporcionado no es válido para el flujo de evaluación de SINFONI."
      });
    }

    const query = 'UPDATE solicitudes SET estado = ? WHERE id = ?';
    const [result] = await db.query(query, [estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "No se encontró la propuesta solicitada para modificar su estado."
      });
    }

    res.status(200).json({
      status: "success",
      message: `El estado de la propuesta ha sido actualizado exitosamente a: ${estado}.`
    });
  } catch (error) {
    console.error("Error al actualizar estado de propuesta:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno en el servidor al intentar modificar el estado.",
      details: error.message
    });
  }
};

module.exports = { 
  createPostulacion, 
  getPostulacionesByUser, 
  getPostulacionesAdmin, 
  updateEstadoPostulacion 
};