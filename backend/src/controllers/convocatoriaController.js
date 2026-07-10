const Convocatoria = require('../models/convocatoriaModel');

// Función helper para generar códigos alfanuméricos aleatorios limpios
const generarCodigoRandom = (prefijo = 'CNV') => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < 5; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return `${prefijo}-${resultado}`;
};

const getConvocatorias = async (req, res) => {
    try {
        const convocatorias = await Convocatoria.getAll();
        res.status(200).json({ status: "success", data: convocatorias });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener convocatorias", details: error.message });
    }
};

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

const createConvocatoria = async (req, res) => {
    try {
        let { codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = req.body;
        
        if (!titulo || !tipo || !fecha_inicio || !fecha_cierre) {
            return res.status(400).json({ status: "error", message: "Los campos titulo, tipo, fecha_inicio y fecha_cierre son obligatorios" });
        }

        // Si el admin no envió un código manual, el backend genera uno automático
        if (!codigo || codigo.trim() === "") {
            codigo = generarCodigoRandom();
        } else {
            // Limpiamos espacios y convertimos a mayúsculas para estandarizar
            codigo = codigo.trim().toUpperCase();
        }

        const newId = await Convocatoria.create({ codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url });
        res.status(201).json({ status: "success", message: "Convocatoria creada exitosamente", data: { id: newId, codigo, titulo } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear la convocatoria", details: error.message });
    }
};

const updateConvocatoria = async (req, res) => {
    try {
        const { id } = req.params;
        let { codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url } = req.body;

        if (!titulo || !tipo || !fecha_inicio || !fecha_cierre) {
            return res.status(400).json({ status: "error", message: "Todos los campos principales son requeridos para actualizar" });
        }

        if (!codigo || codigo.trim() === "") {
            codigo = generarCodigoRandom();
        } else {
            codigo = codigo.trim().toUpperCase();
        }

        const affectedRows = await Convocatoria.update(id, { codigo, titulo, tipo, fecha_inicio, fecha_cierre, bases_url });
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Convocatoria no encontrada para actualizar" });
        }
        res.status(200).json({ status: "success", message: "Convocatoria modificada/aplazada correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar la convocatoria", details: error.message });
    }
};

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