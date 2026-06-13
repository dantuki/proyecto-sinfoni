const Convocatoria = require('../models/convocatoriaModel');

// 1. GET: Listar convocatorias
const getConvocatorias = async (req, res) => {
    try {
        const convocatorias = await Convocatoria.getAll();
        res.status(200).json({ status: "success", data: convocatorias });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener convocatorias", details: error.message });
    }
};

// 2. INFO: Detalle de convocatoria por ID
const getConvocatoriaById = async (req, res) => {
    try {
        const { id } = req.params;
        const convocatoria = await Convocatoria.getById(id);
        if (!convocatoria) {
            return res.status(404).json({ status: "error", message: "Convocatoria no encontrada" });
        }
        res.status(200).json({ status: "success", data: convocatoria });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener la convocatoria", details: error.message });
    }
};

// 3. ADD: Crear convocatoria
const createConvocatoria = async (req, res) => {
    try {
        const { titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = req.body;
        
        if (!titulo || !tipo || !fecha_inicio || !fecha_cierre) {
            return res.status(400).json({ status: "error", message: "Los campos titulo, tipo, fecha_inicio y fecha_cierre son obligatorios" });
        }

        const newId = await Convocatoria.create({ titulo, tipo, fecha_inicio, fecha_cierre, bases_url });
        res.status(201).json({ status: "success", message: "Convocatoria creada exitosamente", data: { id: newId, titulo } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear la convocatoria", details: error.message });
    }
};

// 4. UPDATE: Actualizar convocatoria
const updateConvocatoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = req.body;

        if (!titulo || !tipo || !fecha_inicio || !fecha_cierre) {
            return res.status(400).json({ status: "error", message: "Todos los campos son requeridos para actualizar" });
        }

        const affectedRows = await Convocatoria.update(id, { titulo, tipo, fecha_inicio, fecha_cierre, bases_url });
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Convocatoria no encontrada para actualizar" });
        }
        res.status(200).json({ status: "success", message: "Convocatoria actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar la convocatoria", details: error.message });
    }
};

// 5. DELETE: Eliminar convocatoria
const deleteConvocatoria = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Convocatoria.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Convocatoria no encontrada para eliminar" });
        }
        res.status(200).json({ status: "success", message: "Convocatoria eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar la convocatoria", details: error.message });
    }
};

module.exports = { getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, deleteConvocatoria };