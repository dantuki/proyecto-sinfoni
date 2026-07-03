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

    // 1. Buscamos el usuario actual en la BD
    const usuarioActual = await Usuario.getById(id);
    
    // Validamos si viene dentro de un array o directo como objeto
    const userObj = Array.isArray(usuarioActual) ? usuarioActual[0] : usuarioActual;

    // 2. Clonamos lo que viene en el cuerpo del formulario
    const updateData = { ...req.body };

    // 3. Si el usuario subió un archivo de imagen nuevo
    if (req.file) {
      // Si el registro ya tenía una foto vieja guardada, la borramos físicamente del servidor
      if (userObj && userObj.foto_url) {
        const rutaFotoVieja = path.join(__dirname, '../../', userObj.foto_url);
        if (fs.existsSync(rutaFotoVieja)) {
          fs.unlinkSync(rutaFotoVieja);
        }
      }
      // Inyectamos la nueva ruta de la foto en el objeto de actualización
      updateData.foto_url = `/uploads/${req.file.filename}`;
    }

    // 4. LÓGICA DE PERSISTENCIA SEGURA (UPSERT MANUAL)
    // Si el usuario logueado no existe en la tabla de perfiles (ej: Profesores o Admins nuevos), lo creamos.
    // Si ya existe, simplemente actualizamos sus datos.
    if (!userObj) {
      await Usuario.create({ id, ...updateData });
    } else {
      await Usuario.update(id, updateData);
    }

    res.json({ 
      status: "success", 
      message: "Usuario actualizado correctamente",
      foto_url: updateData.foto_url || (userObj ? userObj.foto_url : null)
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

module.exports = { getUsuarios, getUsuarioById, registrarUsuario, updateUsuario, deleteUsuario, limpiarTablaDesarrollo };