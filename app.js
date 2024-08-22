const dotenv = require('dotenv');
// Cargar variables de entorno
dotenv.config();
const express = require('express');
const app = express();

const path = require('path');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const transferRoutes = require('./routes/transferRoutes');




// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transfers', transferRoutes);

// Ruta para el panel de administración
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Ruta para el panel de usuario normal
app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'user-dashboard.html'));
});

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Configuración de caché
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
