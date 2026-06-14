const Asignacion = require('../models/asignacionModel');

// 1. GET General (Listar)
const getAsignaciones = async (req, res) => {
    try {
        const asignaciones = await Asignacion.getAll();
        res.status(200).json({ status: "success", data: asignaciones });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// 2. GET Específico (Info)
const getAsignacionById = async (req, res) => {
    try {
        const asignacion = await Asignacion.getById(req.params.id);
        if (!asignacion) {
            return res.status(404).json({ status: "fail", message: "Asignación no encontrada" });
        }
        res.status(200).json({ status: "success", data: asignacion });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// 3. POST (Agregar)
const asignarEvaluador = async (req, res) => {
    try {
        const id = await Asignacion.create(req.body);
        res.status(201).json({ status: "success", id });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// 4. PUT (Calificar)
const calificar = async (req, res) => {
    try {
        const affectedRows = await Asignacion.updateEvaluacion(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ status: "fail", message: "Asignación no encontrada para actualizar" });
        }
        res.json({ status: "success", message: "Evaluación registrada" });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// 5. DELETE (Borrar)
const deleteAsignacion = async (req, res) => {
    try {
        const affectedRows = await Asignacion.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ status: "fail", message: "Asignación no encontrada para eliminar" });
        }
        res.json({ status: "success", message: "Asignación eliminada correctamente" });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

module.exports = { 
    getAsignaciones, 
    getAsignacionById, 
    asignarEvaluador, 
    calificar, 
    deleteAsignacion 
};