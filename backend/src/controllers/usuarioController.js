const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt'); 

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.status(200).json({ status: "success", data: usuarios });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.getById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ status: "fail", message: "Usuario no encontrado" });
    }
    res.status(200).json({ status: "success", data: usuario });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

const getEvaluadores = async (req, res) => {
  try {
    const evaluadores = await Usuario.getEvaluadores();
    res.status(200).json({ status: "success", data: evaluadores });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message, error: e.message });
  }
};

const registrarUsuario = async (req, res) => {
  try {
    const { contrasena, ...datosUsuario } = req.body;
    
    let contrasenaHash = contrasena;
    if (contrasena) {
      const salt = await bcrypt.genSalt(10);
      contrasenaHash = await bcrypt.hash(contrasena, salt);
    }

    const id = await Usuario.create({
      ...datosUsuario,
      password: contrasenaHash
    });

    res.status(201).json({ status: "success", id });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

const updateUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const datosActualizar = { ...req.body };

    if (req.files) {
      if (req.files['foto'] && req.files['foto'][0]) {
        datosActualizar.foto_url = `/uploads/${req.files['foto'][0].filename}`;
      }
      if (req.files['certificado'] && req.files['certificado'][0]) {
        datosActualizar.certificado_url = `/uploads/${req.files['certificado'][0].filename}`;
      }
    }

    if (datosActualizar.contrasena) {
      const salt = await bcrypt.genSalt(10);
      datosActualizar.password = await bcrypt.hash(datosActualizar.contrasena, salt);
      delete datosActualizar.contrasena; // Eliminar la clave temporal limpia antes de enviar al Modelo
    }

    const affectedRows = await Usuario.update(id, datosActualizar);
    if (affectedRows === 0) {
      return res.status(404).json({ status: "fail", message: "Usuario no encontrado para actualizar" });
    }

    res.json({ status: "success", message: "Usuario actualizado correctamente" });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const affectedRows = await Usuario.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ status: "fail", message: "Usuario no encontrado para eliminar" });
    }
    res.json({ status: "success", message: "Usuario eliminado correctamente" });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

const limpiarTablaDesarrollo = async (req, res) => {
  try {
    await Usuario.truncate(); 
    res.json({ status: "success", message: "Tabla de usuarios purgada con éxito" });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

module.exports = { 
  getUsuarios, 
  getUsuarioById, 
  getEvaluadores,
  registrarUsuario, 
  updateUsuario, 
  deleteUsuario, 
  limpiarTablaDesarrollo 
};