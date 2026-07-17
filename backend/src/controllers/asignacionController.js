const Asignacion = require('../models/asignacionModel');

// 1. GET General (Listar todas)
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

// 3. GET Asignaciones por Evaluador
const getAsignacionesByEvaluador = async (req, res) => {
  try {
    const { evaluadorId } = req.params;
    const asignaciones = await Asignacion.getByEvaluadorId(evaluadorId);
    res.status(200).json({ status: "success", data: asignaciones });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 4. POST (Agregar / Crear Asignación)
const asignarEvaluador = async (req, res) => {
  try {
    const id = await Asignacion.create(req.body);
    res.status(201).json({ status: "success", id });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

// 5. PUT (Calificar) - MODIFICADO CON SOPORTE PARA ARCHIVOS DE MULTER
const calificar = async (req, res) => {
  const { id } = req.params;
  const { puntaje, comentarios } = req.body;

  // Si Multer procesó un archivo PDF, guardamos su ruta relativa en la base de datos
  const archivo_evaluacion = req.file ? `uploads/${req.file.filename}` : null;

  try {
    // 1. Consultamos si la asignación existe en la BD
    const asignacionExistente = await Asignacion.getById(id);
    if (!asignacionExistente) {
      return res.status(404).json({ status: "fail", message: "Asignación no encontrada" });
    }

    // 2. Si no se subió un archivo nuevo, conservamos la ruta del acta anterior
    const rutaArchivoActualizada = archivo_evaluacion || asignacionExistente.archivo_evaluacion || null;

    // 3. Registramos la calificación en la base de datos
    const affectedRows = await Asignacion.updateEvaluacion(id, {
      puntaje: puntaje ? parseInt(puntaje, 10) : null,
      comentarios: comentarios || null,
      archivo_evaluacion: rutaArchivoActualizada
    });

    if (affectedRows === 0) {
      return res.status(400).json({ status: "fail", message: "No se pudieron actualizar los datos de la evaluación" });
    }

    res.status(200).json({ status: "success", message: "Evaluación registrada con éxito" });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

// 6. DELETE (Borrar)
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
  getAsignacionesByEvaluador,
  asignarEvaluador, 
  calificar, 
  deleteAsignacion 
};