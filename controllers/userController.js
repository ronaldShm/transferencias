const User = require('../models/User');

// Obtener todos los usuarios (usado en el panel de administrador)
exports.getAllUsers = (req, res) => {
    User.getAll((err, result) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
        res.status(200).json(result);
    });
};

// Obtener información del usuario autenticado (incluyendo el balance)
exports.getMe = (req, res) => {
    User.findById(req.userId, (err, user) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            return res.status(500).json({ message: 'Error al obtener el usuario' });
        }
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    });
};
// Actualizar el balance de un usuario
exports.updateUserBalance = (req, res) => {
    const { id, balance } = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor al buscar el usuario' });
        }
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

        User.updateBalance(id, newBalance, (err, result) => {
            if (err) {
                console.error('Error al actualizar el saldo:', err);
                return res.status(500).json({ message: 'Error en el servidor al actualizar el saldo' });
            }

            res.status(200).json({ message: 'Saldo actualizado con éxito', newBalance });
        });
    });
};
// Actualizar el rol de un usuario
exports.updateUserRole = (req, res) => {
    const { id, role } = req.body;

    User.updateRole(id, role, (err) => {
        if (err) {
            console.error('Error al actualizar el rol del usuario:', err);
            return res.status(500).json({ message: 'Error al actualizar el rol del usuario' });
        }
        res.status(200).json({ message: 'Rol actualizado con éxito' });
    });
};

// Crear un nuevo usuario
exports.createUser = (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        console.error('Error: Faltan campos obligatorios');
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    User.findByEmail(email, (err, existingUser) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).json({ message: 'Error al buscar el usuario' });
        }
        if (existingUser) {
            console.error('Error: El correo electrónico ya está en uso');
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }

        const newUser = { first_name, last_name, email, password, role, balance: 0 };

        User.create(newUser, (err, user) => {
            if (err) {
                console.error('Error al crear el usuario:', err);
                return res.status(500).json({ message: 'Error al crear el usuario' });
            }

            console.log('Usuario creado con éxito:', user);
            res.status(201).json({ message: 'Usuario creado con éxito', user });
        });
    });
};

// Obtener el balance del usuario autenticado
exports.getUserBalance = (req, res) => {
    User.findById(req.userId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener el usuario' });
        if (!result || result.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const user = result[0];
        res.status(200).json({ balance: user.balance });
    });
};

exports.updateUserBalance = (req, res) => {
    const { id, balance } = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor al buscar el usuario' });
        }
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const currentBalance = parseFloat(user.balance) || 0;
        const additionalBalance = parseFloat(balance) || 0;

        console.log('Saldo actual:', currentBalance);
        console.log('Saldo a agregar:', additionalBalance);

        const newBalance = currentBalance + additionalBalance;

        console.log('Nuevo saldo:', newBalance);

        User.updateBalance(id, newBalance, (err, result) => {
            if (err) {
                console.error('Error al actualizar el saldo:', err);
                return res.status(500).json({ message: 'Error en el servidor al actualizar el saldo' });
            }

            res.status(200).json({ message: 'Saldo actualizado con éxito', newBalance });
        });
    });
};
