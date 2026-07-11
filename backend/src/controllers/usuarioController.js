const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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
    const { cedula, password } = req.body;
    
    const existe = await Usuario.getByCedula(cedula);
    if (existe) return res.status(400).json({ error: "Cédula ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { ...req.body, password: hashedPassword };
    
    const id = await Usuario.create(userData);
    res.status(201).json({ status: "success", id });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioActual = await Usuario.getById(id);
    const userObj = Array.isArray(usuarioActual) ? usuarioActual[0] : usuarioActual;

    const updateData = { ...req.body };

    if (req.files) {
      if (req.files['foto'] && req.files['foto'][0]) {
        if (userObj && userObj.foto_url) {
          const rutaFotoVieja = path.join(__dirname, '../../', userObj.foto_url);
          if (fs.existsSync(rutaFotoVieja)) {
            fs.unlinkSync(rutaFotoVieja);
          }
        }
        updateData.foto_url = `/uploads/${req.files['foto'][0].filename}`;
      }

      if (req.files['certificado'] && req.files['certificado'][0]) {
        if (userObj && userObj.certificado_url) {
          const rutaCertificadoViejo = path.join(__dirname, '../../', userObj.certificado_url);
          if (fs.existsSync(rutaCertificadoViejo)) {
            fs.unlinkSync(rutaCertificadoViejo);
          }
        }
        updateData.certificado_url = `/uploads/${req.files['certificado'][0].filename}`;
      }
    }

    if (!userObj) {
      await Usuario.create({ id, ...updateData });
    } else {
      await Usuario.update(id, updateData);
    }

    // Buscamos el registro real final para asegurar consistencia absoluta de URLs
    const usuarioFinal = await Usuario.getById(id);

    res.json({ 
      status: "success", 
      message: "Usuario actualizado correctamente",
      data: usuarioFinal
    });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
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

module.exports = { 
  getUsuarios, 
  getUsuarioById, 
  registrarUsuario, 
  updateUsuario, 
  deleteUsuario, 
  limpiarTablaDesarrollo 
};