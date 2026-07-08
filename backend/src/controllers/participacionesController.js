const db = require('../config/db');

// 1. Obtener todas las vinculaciones del sistema (Vista para el Administrador)
exports.getParticipacionesGlobales = async (req, res) => {
  const { rol_proyecto } = req.query;
  
  let query = `
    SELECT part.*, p.codigo AS codigo_proyecto, p.titulo AS titulo_proyecto 
    FROM participaciones part
    JOIN proyectos p ON part.proyecto_id = p.id
  `;
  const params = [];

  if (rol_proyecto) {
    query += ` WHERE part.rol_proyecto = ?`;
    params.push(rol_proyecto);
  }

  try {
    const [results] = await db.query(query, params);
    res.json({ data: results });
  } catch (err) {
    console.error('Error en getParticipacionesGlobales:', err);
    res.status(500).json({ error: 'Error interno de SINFONI al recopilar asignaciones globales.' });
  }
};

// 2. Obtener vinculaciones específicas de un docente (Vista restringida para Profesor)
exports.getParticipacionesPorDocente = async (req, res) => {
  const { userId } = req.params;
  const { rol_proyecto } = req.query;

  let query = `
    SELECT part.*, p.codigo AS codigo_proyecto, p.titulo AS titulo_proyecto 
    FROM participaciones part
    JOIN proyectos p ON part.proyecto_id = p.id
    WHERE part.usuario_id = ?
  `;
  const params = [userId];

  if (rol_proyecto) {
    query += ` AND part.rol_proyecto = ?`;
    params.push(rol_proyecto);
  }

  try {
    const [results] = await db.query(query, params);
    res.json({ data: results });
  } catch (err) {
    console.error('Error en getParticipacionesPorDocente:', err);
    res.status(500).json({ error: 'Error interno al procesar el historial de vinculación docente.' });
  }
};

// 3. Crear e indexar una nueva vinculación de investigador (Acción exclusiva de Admin)
exports.crearVinculacionInvestigador = async (req, res) => {
  const { proyecto_id, usuario_id, rol_proyecto, horas_dedicacion, fecha_vinculacion, estado_vinculacion } = req.body;
  
  if (!proyecto_id || !usuario_id || !rol_proyecto || !horas_dedicacion || !fecha_vinculacion) {
    return res.status(400).json({ error: 'Todos los campos requeridos deben ser completados en el formulario.' });
  }

  const query = `
    INSERT INTO participaciones (proyecto_id, usuario_id, rol_proyecto, horas_dedicacion, fecha_vinculacion, estado_vinculacion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const valores = [
    proyecto_id, 
    usuario_id, 
    rol_proyecto, 
    horas_dedicacion, 
    fecha_vinculacion, 
    estado_vinculacion || 'Activo'
  ];

  try {
    const [result] = await db.query(query, valores);
    res.status(201).json({ 
      message: '¡Investigador vinculado y registrado de manera exitosa en el proyecto!', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Error en crearVinculacionInvestigador:', err);
    res.status(500).json({ error: 'Error de consistencia de llaves en la base de datos de MySQL.' });
  }
};