const connection = require('../config/config');

const Transfer = {
    create: (data, callback) => {
        const query = `INSERT INTO transfers (sender_id, receiver_id, amount, status) VALUES (?, ?, ?, ?)`;
        connection.query(query, [data.sender_id, data.receiver_id, data.amount, data.status], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM transfers';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error al ejecutar la consulta:', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    },
    getByUserId: (userId, callback) => {
        const query = `SELECT * FROM transfers WHERE sender_id = ? OR receiver_id = ?`;
        connection.query(query, [userId, userId], callback);
    },

    updateStatus: (id, status, reason, callback) => {
        const query = `UPDATE transfers SET status = ?, reason = ? WHERE id = ?`;
        connection.query(query, [status, reason, id], callback);
    },

    getPending: (callback) => {
        const query = `SELECT * FROM transfers WHERE status = 'pending'`;
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta de transferencias pendientes:', err);
                return callback(err, null);
            }
            console.log('Resultados de getPending:', results);  // Verifica si los resultados se están recuperando
            callback(null, results);
        });
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            if (results.length === 0) {
                return callback(null, null); // No se encontró el usuario
            }
            callback(null, results[0]); // Devuelve el primer resultado si se encuentra
        });
    },

    findByStatus: (status, callback) => {
        const query = 'SELECT * FROM transfers WHERE status = ?';
        db.query(query, [status], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },
};

module.exports = Transfer;