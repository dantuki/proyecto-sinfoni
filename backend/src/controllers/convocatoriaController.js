const Convocatoria = require('../models/convocatoriaModel');

// Generador de códigos de convocatoria automáticos si el admin no digita uno
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
        let { codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad, bases_url } = req.body;
        
        if (!titulo || !descripcion || !tipo || !fecha_inicio || !fecha_cierre) {
            return res.status(400).json({ status: "error", message: "Los campos titulo, descripcion, tipo, fecha_inicio y fecha_cierre son obligatorios" });
        }

        if (!codigo || codigo.trim() === "") {
            codigo = generarCodigoRandom();
        } else {
            codigo = codigo.trim().toUpperCase();
        }

        const newId = await Convocatoria.create({ 
            codigo, 
            titulo, 
            descripcion, 
            tipo, 
            fecha_inicio, 
            fecha_cierre, 
            presupuesto_max, 
            modalidad, 
            bases_url 
        });

        res.status(201).json({ 
            status: "success", 
            message: "Convocatoria creada exitosamente", 
            data: { id: newId, codigo, titulo } 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear la convocatoria", details: error.message });
    }
};

const updateConvocatoria = async (req, res) => {
    try {
        const { id } = req.params;
        let { codigo, titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad, bases_url } = req.body;

        if (!titulo || !descripcion || !tipo || !fecha_inicio || !fecha_cierre) {
            return res.status(400).json({ status: "error", message: "Todos los campos principales son requeridos para actualizar" });
        }

        if (!codigo || codigo.trim() === "") {
            codigo = generarCodigoRandom();
        } else {
            codigo = codigo.trim().toUpperCase();
        }

        const affectedRows = await Convocatoria.update(id, { 
            codigo, 
            titulo, 
            descripcion, 
            tipo, 
            fecha_inicio, 
            fecha_cierre, 
            presupuesto_max, 
            modalidad, 
            bases_url 
        });

        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Convocatoria no encontrada para actualizar" });
        }
        res.status(200).json({ status: "success", message: "Convocatoria modificada correctamente" });
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