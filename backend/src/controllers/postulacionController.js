const Solicitud = require('../models/solicitudModel');

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

module.exports = { createPostulacion, getPostulacionesByUser };