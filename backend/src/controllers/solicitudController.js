const Solicitud = require('../models/solicitudModel');
const Trazabilidad = require('../models/trazabilidadModel'); 
const db = require('../config/db'); // Importación para la tabla relacional de archivos

// 1. GET: Listar todas las solicitudes
const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getAll(); 
    res.status(200).json({ status: "success", data: solicitudes });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener las solicitudes", details: error.message });
  }
};

// 2. INFO: Detalle de una solicitud por ID
const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.getById(id);
    if (!solicitud) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada" });
    }
    res.status(200).json({ status: "success", data: solicitud });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener la solicitud", details: error.message });
  }
};

// 3. ADD: Crear una nueva solicitud con Múltiples Archivos Dinámicos
const createSolicitud = async (req, res) => {
  try {
    const { usuario_id, convocatoria_id, sede_id, num_solicitud, observaciones, estado, tipos_documentos } = req.body;

    if (!usuario_id || !convocatoria_id || !sede_id || !num_solicitud) {
      return res.status(400).json({ 
        status: "error", 
        message: "Los campos usuario_id, convocatoria_id, sede_id y num_solicitud son obligatorios" 
      });
    }

    const estadoInicial = estado || 'Borrador';
    
    // Guardamos la solicitud limpia en la tabla madre (tu modelo ya no maneja doc_par_1 ni 2)
    const newId = await Solicitud.create({ 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      observaciones, 
      estado: estadoInicial
    });

    // Procesar la ráfaga de archivos si el usuario los adjuntó
    if (req.files && req.files.length > 0) {
      const arrayTipos = tipos_documentos ? JSON.parse(tipos_documentos) : [];
      const queryDoc = `
        INSERT INTO documentos_solicitud (solicitud_id, nombre_archivo, tipo_documento, archivo_url) 
        VALUES (?, ?, ?, ?)
      `;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const tipo = arrayTipos[i] || 'Otros'; // Mapea con 'Presupuesto', 'Cronograma', etc.
        const urlArchivo = '/uploads/' + file.filename;
        await db.query(queryDoc, [newId, file.originalname, tipo, urlArchivo]);
      }
    }

    // Guardar trazabilidad histórica del proceso
    await Trazabilidad.registrarCambio({
      solicitud_id: newId,
      usuario_id: usuario_id,
      estado_anterior: null,
      estado_nuevo: estadoInicial,
      motivo_cambio: "Creación inicial de la solicitud con carga de documentos indexados."
    });

    res.status(201).json({ status: "success", message: "Solicitud y documentos creados exitosamente", data: { id: newId, num_solicitud } });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al crear la solicitud", details: error.message });
  }
};

// 4. UPDATE: Modificar una solicitud y permitir anexar más archivos
const updateSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, convocatoria_id, sede_id, num_solicitud, observaciones, estado, motivo_cambio, tipos_documentos } = req.body;

    if (!usuario_id || !convocatoria_id || !sede_id || !num_solicitud || !estado) {
      return res.status(400).json({ status: "error", message: "Todos los campos principales son requeridos para actualizar" });
    }

    const solicitudPrevia = await Solicitud.getById(id);
    if (!solicitudPrevia) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada para actualizar" });
    }

    // Actualizamos los datos generales de la solicitud
    const affectedRows = await Solicitud.update(id, { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      observaciones, 
      estado 
    });

    // Si subieron nuevos archivos en la actualización, se anexan a la solicitud
    if (req.files && req.files.length > 0) {
      const arrayTipos = tipos_documentos ? JSON.parse(tipos_documentos) : [];
      const queryDoc = `
        INSERT INTO documentos_solicitud (solicitud_id, nombre_archivo, tipo_documento, archivo_url) 
        VALUES (?, ?, ?, ?)
      `;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const tipo = arrayTipos[i] || 'Otros';
        const urlArchivo = '/uploads/' + file.filename;
        await db.query(queryDoc, [id, file.originalname, tipo, urlArchivo]);
      }
    }

    if (affectedRows > 0 || (req.files && req.files.length > 0)) {
      if (solicitudPrevia.estado !== estado) {
        await Trazabilidad.registrarCambio({
          solicitud_id: id,
          usuario_id: usuario_id,
          estado_anterior: solicitudPrevia.estado,
          estado_nuevo: estado,
          motivo_cambio: motivo_cambio || "Actualización o transición de estado de la propuesta con anexos."
        });
      }
    }

    res.status(200).json({ status: "success", message: "Solicitud actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al actualizar la solicitud", details: error.message });
  }
};

// 5. DELETE: Eliminar una solicitud
const deleteSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Solicitud.delete(id);
    if (affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada para eliminar" });
    }
    res.status(200).json({ status: "success", message: "Solicitud eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al eliminar la solicitud", details: error.message });
  }
};

module.exports = { getSolicitudes, getSolicitudById, createSolicitud, updateSolicitud, deleteSolicitud };