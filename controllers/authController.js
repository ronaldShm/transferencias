const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.register = (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    // Verificar si el usuario ya existe
    User.findByEmail(email, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (result.length > 0) return res.status(400).json({ message: 'El usuario ya existe' });

        // Crear el nuevo usuario
        const newUser = {
            first_name,
            last_name,
            email,
            password,
            role: 'user',  // Por defecto, el rol es 'user'
            balance: 0     // Balance inicial de 0
        };

        User.create(newUser, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al crear el usuario' });
            res.status(201).json({ message: 'Usuario creado con éxito' });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    // Busca al usuario por email
    User.findByEmail(email, (err, user) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor al buscar el usuario' });
        }
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Compara la contraseña
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar la contraseña:', err);
                return res.status(500).json({ message: 'Error en el servidor al comparar la contraseña' });
            }
            if (!isMatch) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // Genera el token
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '1h',
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
        });
    });
};