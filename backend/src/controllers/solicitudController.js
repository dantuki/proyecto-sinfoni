const Solicitud = require('../models/solicitudModel');
const Trazabilidad = require('../models/trazabilidadModel'); 

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

// 3. ADD: Crear una nueva solicitud con Auditoría Automática y Archivos
const createSolicitud = async (req, res) => {
try {
const { usuario_id, convocatoria_id, sede_id, num_solicitud, observaciones, estado } = req.body;

// Validar campos relacionales estrictos y obligatorios
if (!usuario_id || !convocatoria_id || !sede_id || !num_solicitud) {
return res.status(400).json({ 
status: "error", 
message: "Los campos usuario_id, convocatoria_id, sede_id y num_solicitud son obligatorios" 
});
}

// Lógica para capturar las rutas de los archivos subidos por Multer
let doc_par_1 = req.body.doc_par_1 || null;
let doc_par_2 = req.body.doc_par_2 || null;

if (req.files) {
if (req.files.doc_par_1) doc_par_1 = '/uploads/' + req.files.doc_par_1[0].filename;
if (req.files.doc_par_2) doc_par_2 = '/uploads/' + req.files.doc_par_2[0].filename;
}

const estadoInicial = estado || 'Borrador';
const newId = await Solicitud.create({ 
usuario_id, 
convocatoria_id, 
sede_id, 
num_solicitud, 
observaciones, 
estado: estadoInicial, 
doc_par_1, 
doc_par_2 
});

// GUARDAR EN LA TABLA DE TRAZABILIDAD EL ESTADO INICIAL
await Trazabilidad.registrarCambio({
solicitud_id: newId,
usuario_id: usuario_id,
estado_anterior: null,
estado_nuevo: estadoInicial,
motivo_cambio: "Creación inicial de la solicitud en la plataforma SINFONI."
});

res.status(201).json({ status: "success", message: "Solicitud creada exitosamente", data: { id: newId, num_solicitud, doc_par_1, doc_par_2 } });
} catch (error) {
res.status(500).json({ status: "error", message: "Error al crear la solicitud", details: error.message });
}
};

// 4. UPDATE: Modificar una solicitud con Auditoría Automática si cambia el estado
const updateSolicitud = async (req, res) => {
try {
const { id } = req.params;
const { usuario_id, convocatoria_id, sede_id, num_solicitud, observaciones, estado, motivo_cambio } = req.body;

if (!usuario_id || !convocatoria_id || !sede_id || !num_solicitud || !estado) {
return res.status(400).json({ status: "error", message: "Todos los campos principales son requeridos para actualizar" });
}

// Obtener la solicitud actual antes de actualizar
const solicitudPrevia = await Solicitud.getById(id);
if (!solicitudPrevia) {
return res.status(404).json({ status: "error", message: "Solicitud no encontrada para actualizar" });
}

// Lógica de archivos para el update (si envían nuevos, se actualizan; si no, conservan los previos)
let doc_par_1 = solicitudPrevia.doc_par_1;
let doc_par_2 = solicitudPrevia.doc_par_2;

if (req.files) {
if (req.files.doc_par_1) doc_par_1 = '/uploads/' + req.files.doc_par_1[0].filename;
if (req.files.doc_par_2) doc_par_2 = '/uploads/' + req.files.doc_par_2[0].filename;
}

const affectedRows = await Solicitud.update(id, { 
usuario_id, 
convocatoria_id, 
sede_id, 
num_solicitud, 
observaciones, 
estado, 
doc_par_1, 
doc_par_2 
});

if (affectedRows > 0) {
// SI EL ESTADO CAMBIÓ, REGISTRAR EN LA TRAZABILIDAD
if (solicitudPrevia.estado !== estado) {
await Trazabilidad.registrarCambio({
solicitud_id: id,
usuario_id: usuario_id,
estado_anterior: solicitudPrevia.estado,
estado_nuevo: estado,
motivo_cambio: motivo_cambio || "Actualización o transición de estado de la propuesta."
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