const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt'); 

// 1. GET General (Listar todos los usuarios)
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.status(200).json({ status: "success", data: usuarios });
  } catch (e) { 
    res.status(500).json({ status: "error", message: e.message, error: e.message }); 
  }
};

// 2. GET Específico (Buscar por ID)
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

// 3. GET Evaluadores (Filtrar solo usuarios con rol Evaluador)
const getEvaluadores = async (req, res) => {
  try {
    const evaluadores = await Usuario.getEvaluadores();
    res.status(200).json({ status: "success", data: evaluadores });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message, error: e.message });
  }
};

// 4. POST (Registrar nuevo usuario)
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

// 5. PUT (Actualizar datos de usuario)
const updateUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const datosActualizar = { ...req.body };

    if (req.files) {
      if (req.files['foto']) {
        datosActualizar.foto_url = `/uploads/${req.files['foto'][0].filename}`;
      }
      if (req.files['certificado']) {
        datosActualizar.certificado_url = `/uploads/${req.files['certificado'][0].filename}`;
      }
    }

    if (datosActualizar.contrasena) {
      const salt = await bcrypt.genSalt(10);
      datosActualizar.password = await bcrypt.hash(datosActualizar.contrasena, salt);
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

// 6. DELETE (Eliminar un usuario)
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

// 7. DELETE (Limpiar tabla para desarrollo rápido)
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