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

// Obtiene solicitudes generales (Admin ve todas, Docentes solo las suyas como medida de seguridad extra)
const getSolicitudes = async (req, res) => {
  try {
    const { id: logueadoId, rol } = req.user;
    let solicitudes;

    if (rol === 'Admin') {
      solicitudes = await Solicitud.getAll();
    } else {
      solicitudes = await Solicitud.getByUserId(logueadoId);
    }

    res.status(200).json({ status: "success", data: solicitudes });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener las solicitudes", details: error.message });
  }
};

// Controlador específico para la vista "Mis Solicitudes" del Docente autenticado
const getMisSolicitudes = async (req, res) => {
  try {
    const usuarioId = req.user.id; // Extraído de forma 100% segura desde el token JWT
    const solicitudes = await Solicitud.getByUserId(usuarioId);
    res.status(200).json({ status: "success", data: solicitudes });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener tus solicitudes", details: error.message });
  }
};

const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: logueadoId, rol } = req.user;

    const solicitud = await Solicitud.getById(id);
    if (!solicitud) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada" });
    }

    // Restricción de Privacidad: Solo el creador de la solicitud o el Admin pueden verla en detalle
    if (rol !== 'Admin' && solicitud.usuario_id !== logueadoId) {
      return res.status(403).json({ status: "error", message: "Acceso denegado: No tienes permiso para ver esta solicitud" });
    }

    res.status(200).json({ status: "success", data: solicitud });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener la solicitud", details: error.message });
  }
};

const createSolicitud = async (req, res) => {
  try {
    // El usuario_id se toma directamente del token verificado para evitar suplantación de identidad
    let usuario_id = req.user.id;

    // Si el usuario es Admin, permitimos que asigne opcionalmente la solicitud a otro id de usuario enviado en el body
    if (req.user.rol === 'Admin' && req.body.usuario_id) {
      usuario_id = parseInt(req.body.usuario_id);
    }

    let { 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta, 
      observaciones, 
      estado, 
      sede_vinculacion 
    } = req.body;

    // Resolución dinámica de sede_id
    if (!sede_id && sede_vinculacion) {
      try {
        const [rows] = await db.query('SELECT id FROM sedes WHERE nombre_sede = ?', [sede_vinculacion]);
        if (rows && rows.length > 0) {
          sede_id = rows[0].id;
        }
      } catch (err) {
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
        message: "Los campos de convocatoria, sede (o sede_vinculacion) y título de propuesta son obligatorios" 
      });
    }

    if (!num_solicitud || num_solicitud.trim() === "") {
      num_solicitud = generarRadicadoRandom();
    } else {
      num_solicitud = num_solicitud.trim().toUpperCase();
    }

    const estadoInicial = estado || 'Borrador';

    const urlPresupuesto = req.files && req.files['presupuesto'] ? '/uploads/' + req.files['presupuesto'][0].filename : null;
    const urlCronograma = req.files && req.files['cronograma'] ? '/uploads/' + req.files['cronograma'][0].filename : null;
    const urlHonestidad = req.files && req.files['honestidad'] ? '/uploads/' + req.files['honestidad'][0].filename : null;
    const urlIdentidad = req.files && req.files['identidad'] ? '/uploads/' + req.files['identidad'][0].filename : null;

    const newId = await Solicitud.create({ 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta,
      observaciones, 
      estado: estadoInicial,
      presupuesto_url: urlPresupuesto,
      cronograma_url: urlCronograma,
      honestidad_url: urlHonestidad,
      id_url: urlIdentidad
    });

    const filesToUpload = [];
    if (req.files) {
      if (req.files['presupuesto'] && req.files['presupuesto'][0]) {
        filesToUpload.push({ file: req.files['presupuesto'][0], tipo: 'Presupuesto' });
      }
      if (req.files['cronograma'] && req.files['cronograma'][0]) {
        filesToUpload.push({ file: req.files['cronograma'][0], tipo: 'Cronograma' });
      }
      if (req.files['honestidad'] && req.files['honestidad'][0]) {
        filesToUpload.push({ file: req.files['honestidad'][0], tipo: 'Honestidad' });
      }
      if (req.files['identidad'] && req.files['identidad'][0]) {
        filesToUpload.push({ file: req.files['identidad'][0], tipo: 'Identidad' });
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
    const { id: logueadoId, rol } = req.user;

    const solicitudPrevia = await Solicitud.getById(id);
    if (!solicitudPrevia) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada para actualizar" });
    }

    // Restricción de Privacidad: Solo el creador original o el Admin pueden editar la solicitud
    if (rol !== 'Admin' && solicitudPrevia.usuario_id !== logueadoId) {
      return res.status(403).json({ status: "error", message: "Acceso denegado: No puedes modificar una propuesta ajena" });
    }

    // Bloqueamos la modificación del propietario. El propietario se mantiene a no ser que el Admin diga lo contrario.
    let usuario_id = solicitudPrevia.usuario_id;
    if (rol === 'Admin' && req.body.usuario_id) {
      usuario_id = parseInt(req.body.usuario_id);
    }

    let { 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta, 
      observaciones, 
      estado, 
      motivo_decision, 
      motivo_cambio, 
      sede_vinculacion 
    } = req.body;

    if (!sede_id && sede_vinculacion) {
      try {
        const [rows] = await db.query('SELECT id FROM sedes WHERE nombre_sede = ?', [sede_vinculacion]);
        if (rows && rows.length > 0) {
          sede_id = rows[0].id;
        }
      } catch (err) {
        const sedesMap = {
          "Apartadó": 1, "Arauca": 2, "Barrancabermeja": 3, "Bogotá": 4, "Bucaramanga": 5,
          "Cali": 6, "Cartago": 7, "El Espinal": 8, "Ibagué": 9, "Medellín": 10, "Montería": 11,
          "Neiva": 12, "Pasto": 13, "Pereira": 14, "Popayán": 15, "Quibdó": 16, "Santa Marta": 17, "Villavicencio": 18
        };
        sede_id = sedesMap[sede_vinculacion] || 1;
      }
    }

    if (!convocatoria_id || !sede_id || !estado || !titulo_propuesta) {
      return res.status(400).json({ status: "error", message: "Todos los campos principales son requeridos para actualizar" });
    }

    if (!num_solicitud || num_solicitud.trim() === "") {
      num_solicitud = solicitudPrevia.num_solicitud;
    } else {
      num_solicitud = num_solicitud.trim().toUpperCase();
    }

    const urlPresupuesto = req.files && req.files['presupuesto'] ? '/uploads/' + req.files['presupuesto'][0].filename : solicitudPrevia.presupuesto_url;
    const urlCronograma = req.files && req.files['cronograma'] ? '/uploads/' + req.files['cronograma'][0].filename : solicitudPrevia.cronograma_url;
    const urlHonestidad = req.files && req.files['honestidad'] ? '/uploads/' + req.files['honestidad'][0].filename : solicitudPrevia.honestidad_url;
    const urlIdentidad = req.files && req.files['identidad'] ? '/uploads/' + req.files['identidad'][0].filename : solicitudPrevia.id_url;

    const affectedRows = await Solicitud.update(id, { 
      usuario_id, 
      convocatoria_id, 
      sede_id, 
      num_solicitud, 
      titulo_propuesta,
      observaciones, 
      estado,
      motivo_decision,
      doc_par_1: solicitudPrevia.doc_par_1,
      doc_par_2: solicitudPrevia.doc_par_2,
      presupuesto_url: urlPresupuesto,
      cronograma_url: urlCronograma,
      honestidad_url: urlHonestidad,
      id_url: urlIdentidad
    });

    const filesToUpload = [];
    if (req.files) {
      if (req.files['presupuesto'] && req.files['presupuesto'][0]) {
        filesToUpload.push({ file: req.files['presupuesto'][0], tipo: 'Presupuesto' });
      }
      if (req.files['cronograma'] && req.files['cronograma'][0]) {
        filesToUpload.push({ file: req.files['cronograma'][0], tipo: 'Cronograma' });
      }
      if (req.files['honestidad'] && req.files['honestidad'][0]) {
        filesToUpload.push({ file: req.files['honestidad'][0], tipo: 'Honestidad' });
      }
      if (req.files['identidad'] && req.files['identidad'][0]) {
        filesToUpload.push({ file: req.files['identidad'][0], tipo: 'Identidad' });
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
          usuario_id: logueadoId,
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
    const { id: logueadoId, rol } = req.user;

    const solicitudPrevia = await Solicitud.getById(id);
    if (!solicitudPrevia) {
      return res.status(404).json({ status: "error", message: "Solicitud no encontrada para eliminar" });
    }

    // Restricción de Privacidad: Solo el dueño de la solicitud o el Admin pueden eliminarla
    if (rol !== 'Admin' && solicitudPrevia.usuario_id !== logueadoId) {
      return res.status(403).json({ status: "error", message: "Acceso denegado: No tienes permisos para eliminar esta solicitud" });
    }

    await Solicitud.delete(id);
    res.status(200).json({ status: "success", message: "Solicitud eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al eliminar la solicitud", details: error.message });
  }
};

module.exports = { 
  getSolicitudes, 
  getMisSolicitudes, 
  getSolicitudById, 
  createSolicitud, 
  updateSolicitud, 
  deleteSolicitud 
};