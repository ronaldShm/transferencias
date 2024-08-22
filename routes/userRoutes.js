const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');


// Ruta para obtener la información del usuario autenticado
router.get('/me', authMiddleware.verifyToken, userController.getMe);
// Ruta para obtener todos los usuarios (solo accesible para administradores)
router.get('/all', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);


// Ruta para actualizar el saldo de un usuario (solo accesible para administradores)
router.put('/update-balance', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.updateUserBalance);

// Ruta para actualizar el rol de un usuario (solo accesible para administradores)
router.put('/update-role', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.updateUserRole);

// Ruta para que el administrador cree usuarios
router.post('/create', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.createUser);

module.exports = router;
