const Asignacion = require('../models/asignacionModel');

const asignarEvaluador = async (req, res) => {
    try {
        const id = await Asignacion.create(req.body);
        res.status(201).json({ status: "success", id });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const calificar = async (req, res) => {
    try {
        await Asignacion.updateEvaluacion(req.params.id, req.body);
        res.json({ status: "success", message: "Evaluación registrada" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { asignarEvaluador, calificar };