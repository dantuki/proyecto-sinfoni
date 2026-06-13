const Usuario = require('../models/usuarioModel');

// 1. GET: Listar todos los usuarios
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.getAll();
        res.status(200).json({ status: "success", data: usuarios });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener los usuarios", details: error.message });
    }
};

// 2. INFO: Obtener perfil por ID (Ya lo tenías)
const getUsuarioPerfil = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.getById(id);
        if (!usuario) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }
        res.status(200).json({ status: "success", data: usuario });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener el perfil", details: error.message });
    }
};

// 3. ADD: Registrar usuario (Ya lo tenías)
const registrarUsuario = async (req, res) => {
    try {
        const { cedula, nombre_completo, email, password, rol } = req.body;
        if (!cedula || !nombre_completo || !email || !password) {
            return res.status(400).json({ status: "error", message: "Campos obligatorios faltantes" });
        }
        const existeCedula = await Usuario.getByCedula(cedula);
        if (existeCedula) return res.status(400).json({ status: "error", message: "La cédula ya existe" });
        
        const existeEmail = await Usuario.getByEmail(email);
        if (existeEmail) return res.status(400).json({ status: "error", message: "El correo ya existe" });

        const newUserId = await Usuario.create({ cedula, nombre_completo, email, password, rol });
        res.status(201).json({ status: "success", message: "Usuario registrado", data: { id: newUserId, email, rol: rol || 'Profesor' } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al registrar usuario", details: error.message });
    }
};

// 4. UPDATE: Actualizar usuario
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { cedula, nombre_completo, email, rol } = req.body;

        if (!cedula || !nombre_completo || !email || !rol) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios para actualizar" });
        }

        const affectedRows = await Usuario.update(id, { cedula, nombre_completo, email, rol });
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado para actualizar" });
        }

        res.status(200).json({ status: "success", message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar usuario", details: error.message });
    }
};

// 5. DELETE: Eliminar usuario
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Usuario.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado para eliminar" });
        }
        res.status(200).json({ status: "success", message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar usuario", details: error.message });
    }
};

module.exports = { getUsuarios, getUsuarioPerfil, registrarUsuario, updateUsuario, deleteUsuario };