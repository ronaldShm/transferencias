const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1]; // Obtener el token del encabezado de autorización

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(401).json({ message: 'Token no válido' });
        }
        req.userId = decoded.id; // Guardar el ID del usuario en la solicitud
        req.userRole = decoded.role; // Guardar el rol del usuario en la solicitud
        next(); // Continuar al siguiente middleware o ruta
    });
};

// Middleware para verificar si el usuario es administrador
exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'No autorizado. Solo los administradores pueden acceder.' });
    }
    next(); // Si el rol es 'admin', continuar al siguiente middleware o ruta
};
