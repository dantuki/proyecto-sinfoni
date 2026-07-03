const Noticia = require('../models/noticiaModel');
const fs = require('fs');
const path = require('path');

const getNoticiasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const data = await Noticia.getAllByUsuario(usuarioId);
    // Formato estructurado idéntico al de usuarios
    res.json({ status: "success", data });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const crearNoticia = async (req, res) => {
  try {
    const { usuario_id, titulo, contenido, fecha } = req.body;
    let archivo_url = null;

    if (req.file) {
      archivo_url = `/uploads/${req.file.filename}`;
    }

    const id = await Noticia.create({ usuario_id, titulo, contenido, archivo_url, fecha });
    res.status(201).json({ status: "success", id });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const actualizarNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fecha } = req.body;
    
    const noticiaActual = await Noticia.getById(id);
    if (!noticiaActual) return res.status(404).json({ error: "Registro no encontrado" });

    let archivo_url = noticiaActual.archivo_url;

    // Si suben un archivo nuevo, borramos el viejo físicamente para no llenar el servidor de basura
    if (req.file) {
      if (noticiaActual.archivo_url) {
        const rutaVieja = path.join(__dirname, '../../', noticiaActual.archivo_url);
        if (fs.existsSync(rutaVieja)) fs.unlinkSync(rutaVieja);
      }
      archivo_url = `/uploads/${req.file.filename}`;
    }

    await Noticia.update(id, { titulo, contenido, archivo_url, fecha });
    res.json({ status: "success", message: "Registro actualizado correctamente" });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const eliminarNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.getById(id);
    
    // Eliminamos el archivo adjunto si existe antes de borrar el registro de la BD
    if (noticia && noticia.archivo_url) {
      const rutaArchivo = path.join(__dirname, '../../', noticia.archivo_url);
      if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
    }

    await Noticia.delete(id);
    res.json({ status: "success", message: "Registro eliminado correctamente" });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

module.exports = { getNoticiasUsuario, crearNoticia, actualizarNoticia, eliminarNoticia };