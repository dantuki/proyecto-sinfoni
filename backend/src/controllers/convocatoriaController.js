const Convocatoria = require('../models/convocatoriaModel');

// Generador de códigos automático blindado (Formato: CNV-AÑO-NUMERO)
const generarCodigoAutomatico = () => {
  const anio = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); 
  return `CNV-${anio}-${random}`;
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
    let { titulo, descripcion, tipo, fecha_inicio, fecha_cierre, presupuesto_max, modalidad } = req.body;
    
    if (!titulo || !descripcion || !tipo || !fecha_inicio || !fecha_cierre) {
      return res.status(400).json({ status: "error", message: "Los campos principales son obligatorios" });
    }

    // Automatización total del código del lado del servidor
    const codigo = generarCodigoAutomatico();

    // Obtener la ruta del archivo subido
    let bases_url = null;
    if (req.file) {
      bases_url = `http://localhost:5000/uploads/${req.file.filename}`;
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

    // Si el usuario carga un nuevo PDF, reemplazamos la URL; de lo contrario, conservamos la que ya existía
    if (req.file) {
      bases_url = `http://localhost:5000/uploads/${req.file.filename}`;
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