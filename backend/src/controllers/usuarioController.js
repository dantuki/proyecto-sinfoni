const Usuario = require('../models/usuarioModel');

const getUsuarios = async (req, res) => {
    try {
        const data = await Usuario.getAll();
        res.json({ status: "success", data });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const getUsuarioById = async (req, res) => {
    try {
        const data = await Usuario.getById(req.params.id);
        res.json({ status: "success", data });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const registrarUsuario = async (req, res) => {
    try {
        const { cedula } = req.body;
        const existe = await Usuario.getByCedula(cedula);
        if (existe) return res.status(400).json({ error: "Cédula ya existe" });
        const id = await Usuario.create(req.body);
        res.status(201).json({ status: "success", id });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateUsuario = async (req, res) => {
    try {
        await Usuario.update(req.params.id, req.body);
        res.json({ status: "success" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteUsuario = async (req, res) => {
    try {
        await Usuario.delete(req.params.id);
        res.json({ status: "success" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const limpiarTablaDesarrollo = async (req, res) => {
    try {
        await Usuario.truncate();
        res.json({ status: "success", message: "Tabla reseteada" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { getUsuarios, getUsuarioById, registrarUsuario, updateUsuario, deleteUsuario, limpiarTablaDesarrollo };