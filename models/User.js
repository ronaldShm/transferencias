const db = require('../config/config');
const bcrypt = require('bcryptjs');

const User = {
    create: (userData) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO users (first_name, last_name, email, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(query, [userData.first_name, userData.last_name, userData.email, userData.password, userData.role, userData.balance], (err, results) => {
                if (err) return reject(err);
                resolve({ id: results.insertId, ...userData });
            });
        });
    },
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE email = ?';
            db.query(query, [email], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length > 0) {
                    resolve(results[0]); // Devolver el primer usuario encontrado
                } else {
                    resolve(null); // No se encontró ningún usuario con ese correo
                }
            });
        });
    },
    getAll: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users';
            db.query(query, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    updateBalance: (id, newBalance) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET balance = ? WHERE id = ?';
            db.query(query, [newBalance, id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    },

    updateRole: (id, role) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET role = ? WHERE id = ?';
            db.query(query, [role, id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length > 0) {
                    resolve(results[0]); // Devolver el primer usuario encontrado
                } else {
                    resolve(null); // No se encontró ningún usuario con ese ID
                }
            });
        });
    },
};

module.exports = User;
