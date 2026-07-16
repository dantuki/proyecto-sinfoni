const Solicitud = require('../models/solicitudModel');
const Trazabilidad = require('../models/trazabilidadModel'); 
const db = require('../config/db');

const generarRadicadoRandom = (prefijo = 'SOL') => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let resultado = '';
  for (let i = 0; i < 5; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return `${prefijo}-${resultado}`;
};

const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getAll(); 
    res.status(200).json({ status: "success", data: solicitudes });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener las solicitudes", details: error.message });
  }
};

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

const createSolicitud = async (req, res) => {
  try {
    let { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta, 
      observaciones, 
      estado, 
      tipos_documentos,
      sede_vinculacion 
    } = req.body;

    // Resolución dinámica de sede_id si se envía por nombre de vinculación desde el front
    if (!sede_id && sede_vinculacion) {
      try {
        const [rows] = await db.query('SELECT id FROM sedes WHERE nombre = ?', [sede_vinculacion]);
        if (rows && rows.length > 0) {
          sede_id = rows[0].id;
        }
      } catch (err) {
        // Fallback alfabético por ID en caso de que falle la consulta directa
        const sedesMap = {
          "Apartadó": 1, "Arauca": 2, "Barrancabermeja": 3, "Bogotá": 4, "Bucaramanga": 5,
          "Cali": 6, "Cartago": 7, "El Espinal": 8, "Ibagué": 9, "Medellín": 10, "Montería": 11,
          "Neiva": 12, "Pasto": 13, "Pereira": 14, "Popayán": 15, "Quibdó": 16, "Santa Marta": 17, "Villavicencio": 18
        };
        sede_id = sedesMap[sede_vinculacion] || 1;
      }
    }

    if (!usuario_id || !convocatoria_id || !sede_id || !titulo_propuesta) {
      return res.status(400).json({ 
        status: "error", 
        message: "Los campos usuario_id, convocatoria_id, sede_id (o sede_vinculacion) y titulo_propuesta son obligatorios" 
      });
    }

    if (!num_solicitud || num_solicitud.trim() === "") {
      num_solicitud = generarRadicadoRandom();
    } else {
      num_solicitud = num_solicitud.trim().toUpperCase();
    }

    const estadoInicial = estado || 'Borrador';

    const newId = await Solicitud.create({ 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta,
      observaciones, 
      estado: estadoInicial
    });

    // Procesamiento de los archivos subidos por campos específicos
    const filesToUpload = [];
    if (req.files) {
      if (req.files['presupuesto'] && req.files['presupuesto'][0]) {
        filesToUpload.push({ file: req.files['presupuesto'][0], tipo: 'Presupuesto General' });
      }
      if (req.files['cronograma'] && req.files['cronograma'][0]) {
        filesToUpload.push({ file: req.files['cronograma'][0], tipo: 'Cronograma de Actividades' });
      }
      if (req.files['honestidad'] && req.files['honestidad'][0]) {
        filesToUpload.push({ file: req.files['honestidad'][0], tipo: 'Declaración de Honestidad' });
      }
      if (req.files['identidad'] && req.files['identidad'][0]) {
        filesToUpload.push({ file: req.files['identidad'][0], tipo: 'Soporte Documento Identidad' });
      }
    }

    if (filesToUpload.length > 0) {
      const queryDoc = `
        INSERT INTO documentos_solicitud (solicitud_id, nombre_archivo, tipo_documento, archivo_url) 
        VALUES (?, ?, ?, ?)
      `;

      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        const file = item.file;
        const urlArchivo = '/uploads/' + file.filename;
        await db.query(queryDoc, [newId, file.originalname, item.tipo, urlArchivo]);
      }
    }

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

const updateSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    let { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta, 
      observaciones, 
      estado, 
      motivo_decision, 
      motivo_cambio, 
      tipos_documentos,
      sede_vinculacion 
    } = req.body;

    // Resolución dinámica de sede_id si se envía por nombre de vinculación desde el front
    if (!sede_id && sede_vinculacion) {
      try {
        const [rows] = await db.query('SELECT id FROM sedes WHERE nombre = ?', [sede_vinculacion]);
        if (rows && rows.length > 0) {
          sede_id = rows[0].id;
        }
      } catch (err) {
        // Fallback alfabético por ID en caso de que falle la consulta directa
        const sedesMap = {
          "Apartadó": 1, "Arauca": 2, "Barrancabermeja": 3, "Bogotá": 4, "Bucaramanga": 5,
          "Cali": 6, "Cartago": 7, "El Espinal": 8, "Ibagué": 9, "Medellín": 10, "Montería": 11,
          "Neiva": 12, "Pasto": 13, "Pereira": 14, "Popayán": 15, "Quibdó": 16, "Santa Marta": 17, "Villavicencio": 18
        };
        sede_id = sedesMap[sede_vinculacion] || 1;
      }
    }

    if (!usuario_id || !convocatoria_id || !sede_id || !estado || !titulo_propuesta) {
      return res.status(400).json({ status: "error", message: "Todos los campos principales son requeridos para actualizar" });
    }

    const solicitudPrevia = await Solicitud.getById(id);
    if (!solicitudPrevia) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada para actualizar" });
    }

    if (!num_solicitud || num_solicitud.trim() === "") {
      num_solicitud = solicitudPrevia.num_solicitud;
    } else {
      num_solicitud = num_solicitud.trim().toUpperCase();
    }

    const affectedRows = await Solicitud.update(id, { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta,
      observaciones, 
      estado,
      motivo_decision
    });

    // Procesamiento de los archivos subidos por campos específicos
    const filesToUpload = [];
    if (req.files) {
      if (req.files['presupuesto'] && req.files['presupuesto'][0]) {
        filesToUpload.push({ file: req.files['presupuesto'][0], tipo: 'Presupuesto General' });
      }
      if (req.files['cronograma'] && req.files['cronograma'][0]) {
        filesToUpload.push({ file: req.files['cronograma'][0], tipo: 'Cronograma de Actividades' });
      }
      if (req.files['honestidad'] && req.files['honestidad'][0]) {
        filesToUpload.push({ file: req.files['honestidad'][0], tipo: 'Declaración de Honestidad' });
      }
      if (req.files['identidad'] && req.files['identidad'][0]) {
        filesToUpload.push({ file: req.files['identidad'][0], tipo: 'Soporte Documento Identidad' });
      }
    }

    if (filesToUpload.length > 0) {
      const queryDoc = `
        INSERT INTO documentos_solicitud (solicitud_id, nombre_archivo, tipo_documento, archivo_url) 
        VALUES (?, ?, ?, ?)
      `;

      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        const file = item.file;
        const urlArchivo = '/uploads/' + file.filename;
        await db.query(queryDoc, [id, file.originalname, item.tipo, urlArchivo]);
      }
    }

    if (affectedRows > 0 || filesToUpload.length > 0) {
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