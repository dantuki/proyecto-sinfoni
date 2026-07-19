const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db.js');

const register = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    let { nombre_completo, email, password, cedula, rol, captchaToken } = req.body;

    if (!nombre_completo || !email || !password) {
      connection.release();
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (!captchaToken) {
      connection.release();
      return res.status(400).json({ error: 'Por favor, completa el reCAPTCHA de seguridad.' });
    }

    const cleanedEmail = email.trim().toLowerCase();
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LfwDj4tAAAAAADxjTBocXyVH9FXTkzjJkRhkZ5j';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    
    let captchaResult = { success: false };
    try {
      const captchaVerify = await fetch(verifyUrl, { method: 'POST' });
      captchaResult = await captchaVerify.json();
    } catch (fetchError) {
      console.warn("Google reCAPTCHA inalcanzable. Se permite bypass en desarrollo local:", fetchError.message);
      captchaResult = { success: true };
    }

    if (!captchaResult.success) {
      connection.release();
      return res.status(400).json({ error: 'La validación del reCAPTCHA ha fallado o expiró.' });
    }

    const rolesPermitidos = ['Admin', 'Profesor', 'Evaluador'];
    const rolFinal = rolesPermitidos.includes(rol) ? rol : 'Profesor';
    const cedulaFinal = cedula || `CC-${Date.now().toString().slice(-8)}`;

    const [existingUser] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [cleanedEmail]);
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Iniciar Transacción Atómica
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [cedulaFinal, nombre_completo, cleanedEmail, passwordHash, rolFinal]
    );

    const nuevoUsuarioId = userResult.insertId;

    await connection.query(
      'INSERT INTO login (usuario_id, email, password) VALUES (?, ?, ?)',
      [nuevoUsuarioId, cleanedEmail, passwordHash]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({ 
      message: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
      user: { id: nuevoUsuarioId, nombre_completo, email: cleanedEmail, rol: rolFinal }
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error capturado en register:", error);
    return res.status(400).json({ 
      error: 'Error en la base de datos al registrar.', 
      details: error.sqlMessage || error.message 
    });
  }
};

const login = async (req, res, next) => {
  try {
    let { email, password, captchaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
    }

    if (!captchaToken) {
      return res.status(400).json({ error: 'Por favor, completa el reCAPTCHA de seguridad.' });
    }

    const cleanedEmail = email.trim().toLowerCase();
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LfwDj4tAAAAAADxjTBocXyVH9FXTkzjJkRhkZ5j';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    
    let captchaResult = { success: false };
    try {
      const captchaVerify = await fetch(verifyUrl, { method: 'POST' });
      captchaResult = await captchaVerify.json();
    } catch (fetchError) {
      console.warn("Google reCAPTCHA inalcanzable. Se permite bypass en desarrollo local:", fetchError.message);
      captchaResult = { success: true };
    }

    if (!captchaResult.success) {
      return res.status(400).json({ error: 'La validación del reCAPTCHA ha fallado o expiró.' });
    }

    const [loginRows] = await pool.query('SELECT * FROM login WHERE email = ?', [cleanedEmail]);
    const loginData = loginRows[0];

    if (!loginData) {
      return res.status(401).json({ error: 'Credenciales incorrectas o usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, loginData.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Contraseña inválida.' });
    }

    const [userRows] = await pool.query(
      'SELECT id, nombre_completo, email, rol FROM usuarios WHERE id = ?', 
      [loginData.usuario_id]
    );
    const user = userRows[0];

    if (!user) {
      return res.status(404).json({ error: 'El perfil de usuario correspondiente no existe.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secret_archivex_2026',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Ingreso exitoso',
      token,
      user
    });

  } catch (error) {
    console.error("Error capturado en login:", error);
    return res.status(500).json({ 
      error: 'Error interno del servidor en el inicio de sesión.', 
      details: error.sqlMessage || error.message 
    });
  }
};

module.exports = { register, login };