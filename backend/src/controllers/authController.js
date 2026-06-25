import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import nodemailer from 'nodemailer';
import axios from 'axios';

// Configuración del transportador de correo (Recuperación)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// REGISTRO
export const register = async (req, res, next) => {
  try {
    const { cedula, nombre_completo, email, password, confirmPassword } = req.body;

    if (!cedula || !nombre_completo || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    // Verificar unicidad de Cédula y Email en la tabla usuarios
    const [existingUser] = await pool.query(
      'SELECT id FROM usuarios WHERE cedula = ? OR email = ?',
      [cedula, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'La cédula o el correo ya se encuentran registrados.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar con rol por defecto: Profesor
    await pool.query(
      'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [cedula, nombre_completo, email, passwordHash, 'Profesor']
    );

    return res.status(201).json({ message: 'Usuario registrado exitosamente como Profesor.' });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas. Contraseña incorrecta.' });
    }

    // Generar JWT válido por 8 horas
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

// RECUPERAR CONTRASEÑA
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
    }

    const [rows] = await pool.query('SELECT id, email FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: 'No existe una cuenta vinculada a este correo.' });
    }

    // Token temporal firmado por 15 minutos exclusivo para reset
    const resetToken = jwt.sign({ id: user.id, action: 'reset_password' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"ARCHIVEX" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Restablecer Contraseña — ARCHIVEX',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña: <a href="${resetUrl}">${resetUrl}</a></p>`
    });

    return res.status(200).json({ message: 'Enlace de recuperación enviado al correo.' });
  } catch (error) {
    next(error);
  }
};

// RESETEAR CONTRASEÑA
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'El token y la nueva contraseña son requeridos.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener mínimo 8 caracteres.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.action !== 'reset_password') {
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHash, decoded.id]);

    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    return res.status(400).json({ error: 'El token de recuperación ha caducado o es erróneo.' });
  }
};