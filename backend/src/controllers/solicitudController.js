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
let { usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, tipos_documentos } = req.body;

if (!usuario_id || !convocatoria_id || !sede_id || !titulo_propuesta) {
return res.status(400).json({ 
status: "error", 
message: "Los campos usuario_id, convocatoria_id, sede_id y titulo_propuesta son obligatorios" 
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
await db.query(queryDoc, [newId, file.originalname, tipo, urlArchivo]);
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
let { usuario_id, convocatoria_id, sede_id, num_solicitud, titulo_propuesta, observaciones, estado, motivo_decision, motivo_cambio, tipos_documentos } = req.body;

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