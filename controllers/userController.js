const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Obtener todos los usuarios (usado en el panel de administrador)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        return res.status(200).json(users);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener información del usuario autenticado (incluyendo el balance)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};

// Actualizar el balance de un usuario
exports.updateUserBalance = async (req, res) => {
    const { id, balance } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            console.error(`Usuario con ID ${id} no encontrado`);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const currentBalance = parseFloat(user.balance) || 0;
        const additionalBalance = parseFloat(balance) || 0;

        console.log('Saldo actual:', currentBalance);
        console.log('Saldo a agregar:', additionalBalance);

        const newBalance = currentBalance + additionalBalance;

        console.log('Nuevo saldo:', newBalance);

        await User.updateBalance(id, newBalance);
        return res.status(200).json({ message: 'Saldo actualizado con éxito', newBalance });
    } catch (err) {
        console.error('Error al actualizar el saldo:', err);
        return res.status(500).json({ message: 'Error en el servidor al actualizar el saldo' });
    }
};

// Actualizar el rol de un usuario
exports.updateUserRole = async (req, res) => {
    const { id, role } = req.body;

    try {
        await User.updateRole(id, role);
        return res.status(200).json({ message: 'Rol actualizado con éxito' });
    } catch (err) {
        console.error('Error al actualizar el rol del usuario:', err);
        return res.status(500).json({ message: 'Error al actualizar el rol del usuario' });
    }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        console.error('Error: Faltan campos obligatorios');
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.error('Error: El correo electrónico ya está en uso');
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword, // Guardar la contraseña encriptada
            role,
            balance: 0
        };

        const user = await User.create(newUser);
        console.log('Usuario creado con éxito:', user);
        res.status(201).json({ message: 'Usuario creado con éxito', user });
    } catch (err) {
        console.error('Error al crear el usuario:', err);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

// Obtener el balance del usuario autenticado
exports.getUserBalance = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ balance: user.balance });
    } catch (err) {
        console.error('Error al obtener el balance del usuario:', err);
        return res.status(500).json({ message: 'Error al obtener el balance del usuario' });
    }
};
