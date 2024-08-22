const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role: 'user',  // Por defecto, el rol es 'user'
            balance: 0     // Balance inicial de 0
        };

        await User.create(newUser);
        return res.status(201).json({ message: 'Usuario creado con éxito' });

    } catch (err) {
        console.error('Error en el registro:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca al usuario por email
        const user = await User.findByEmail(email);

        // Verifica si el usuario no existe
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Compara la contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Genera el token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '4h',
        });

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Error en el inicio de sesión:', err);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
    }
};
