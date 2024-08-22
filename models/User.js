const db = require('../config/config');
const bcrypt = require('bcryptjs');

const User = {
    create: (userData, callback) => {
        const query = 'INSERT INTO users (first_name, last_name, email, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [userData.first_name, userData.last_name, userData.email, userData.password, userData.role, userData.balance], (err, results) => {
            if (err) return callback(err, null);
            callback(null, { id: results.insertId, ...userData });
        });
    },

    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE email = ?';
            db.query(query, [email], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    getAll: (callback) => {
        const query = `SELECT * FROM users`;
        db.query(query, callback);
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

    updateRole: (id, role, callback) => {
        const query = `UPDATE users SET role = ? WHERE id = ?`;
        db.query(query, [role, id], callback);
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },


};

module.exports = User;