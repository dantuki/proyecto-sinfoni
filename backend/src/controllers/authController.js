const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db.js');

// 1. REGISTRO (Para tu pantalla de "Solicitud de Cuenta")
const register = async (req, res, next) => {
  try {
    const { nombre_completo, email, password, cedula, rol } = req.body;

    // Validaciones básicas de campos obligatorios
    if (!nombre_completo || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Validar que el rol sea uno de los permitidos en el ENUM de la base de datos
    const rolesPermitidos = ['Admin', 'Profesor', 'Evaluador'];
    const rolFinal = rolesPermitidos.includes(rol) ? rol : 'Profesor';

    // Como tu interfaz de "Solicitud de Cuenta" no pide cédula, le generamos una interna basada en el tiempo 
    // o usamos la que venga en el req.body si decides agregar el input luego.
    const cedulaFinal = cedula || `CC-${Date.now().toString().slice(-8)}`;

    // 1. Verificar si el correo ya existe en la base de datos
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar la contraseña con Bcrypt antes de guardarla
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insertar primero en la tabla general de 'usuarios' con el rol dinámico obtenido
    const [userResult] = await pool.query(
      'INSERT INTO usuarios (cedula, nombre_completo, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [cedulaFinal, nombre_completo, email, passwordHash, rolFinal]
    );

    const nuevoUsuarioId = userResult.insertId;

    // 4. Insertar en tu nueva tabla de 'login' para que quede habilitado para entrar
    await pool.query(
      'INSERT INTO login (usuario_id, email, password) VALUES (?, ?, ?)',
      [nuevoUsuarioId, email, passwordHash]
    );

    return res.status(201).json({ 
      message: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
      user: { id: nuevoUsuarioId, nombre_completo, email, rol: rolFinal }
    });

  } catch (error) {
    next(error);
  }
};

// 2. LOGIN (Para tu pantalla de "Autenticación")
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
    }

    // Buscar las credenciales directamente en la tabla 'login'
    const [loginRows] = await pool.query('SELECT * FROM login WHERE email = ?', [email]);
    const loginData = loginRows[0];

    if (!loginData) {
      return res.status(401).json({ error: 'Credenciales incorrectas o usuario no encontrado.' });
    }

    // Comparar la contraseña ingresada con el hash guardado
    const isMatch = await bcrypt.compare(password, loginData.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Contraseña inválida.' });
    }

    // Traer los datos complementarios del perfil del usuario
    const [userRows] = await pool.query(
      'SELECT id, nombre_completo, email, rol FROM usuarios WHERE id = ?', 
      [loginData.usuario_id]
    );
    const user = userRows[0];

    // Generar el token de sesión (JWT)
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
    next(error);
  }
};

module.exports = {
  register,
  login
};