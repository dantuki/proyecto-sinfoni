const Sede = require('../models/sedeModel');

// 1. Obtener todas las sedes (Ya lo tenías)
const getSedes = async (req, res) => {
    try {
        const sedes = await Sede.getAll();
        res.status(200).json({ status: "success", data: sedes });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener las sedes", details: error.message });
    }
};

// 2. Info: Obtener una sede por ID
const getSedeById = async (req, res) => {
    try {
        const { id } = req.params;
        const sede = await Sede.getById(id);
        if (!sede) {
            return res.status(404).json({ status: "error", message: "Sede no encontrada" });
        }
        res.status(200).json({ status: "success", data: sede });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener la sede", details: error.message });
    }
};

// 3. Agregar: Crear una nueva sede
const createSede = async (req, res) => {
    try {
        const { nombre_sede } = req.body;
        if (!nombre_sede) {
            return res.status(400).json({ status: "error", message: "El nombre de la sede es obligatorio" });
        }
        const newId = await Sede.create(nombre_sede);
        res.status(201).json({ status: "success", message: "Sede creada con éxito", data: { id: newId, nombre_sede } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear la sede", details: error.message });
    }
};

// 4. Update: Modificar una sede
const updateSede = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_sede } = req.body;
        if (!nombre_sede) {
            return res.status(400).json({ status: "error", message: "El nuevo nombre es obligatorio" });
        }
        const affectedRows = await Sede.update(id, nombre_sede);
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Sede no encontrada para actualizar" });
        }
        res.status(200).json({ status: "success", message: "Sede actualizada con éxito" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar la sede", details: error.message });
    }
};

// 5. Delete: Eliminar una sede
const deleteSede = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Sede.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Sede no encontrada para eliminar" });
        }
        res.status(200).json({ status: "success", message: "Sede eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar la sede", details: error.message });
    }
};

module.exports = { getSedes, getSedeById, createSede, updateSede, deleteSede };