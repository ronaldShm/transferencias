const connection = require('../config/config');

const Transfer = {
    create: async (data) => {
        const query = `INSERT INTO transfers (sender_id, receiver_id, amount, status) VALUES (?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            connection.query(query, [data.sender_id, data.receiver_id, data.amount, data.status], (err, results) => {
                if (err) {
                    console.error('Error al crear la transferencia:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    findAll: async () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    transfers.id, 
                    transfers.amount, 
                    transfers.status, 
                    transfers.reason,
                    sender.first_name AS sender_first_name, 
                    sender.last_name AS sender_last_name, 
                    receiver.first_name AS receiver_first_name, 
                    receiver.last_name AS receiver_last_name 
                FROM 
                    transfers
                JOIN 
                    users AS sender ON transfers.sender_id = sender.id
                JOIN 
                    users AS receiver ON transfers.receiver_id = receiver.id
            `;
            connection.query(query, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    getByUserId: async (userId) => {
        const query = `SELECT * FROM transfers WHERE sender_id = ? OR receiver_id = ?`;
        return new Promise((resolve, reject) => {
            connection.query(query, [userId, userId], (err, results) => {
                if (err) {
                    console.error('Error al obtener transferencias por usuario:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    updateStatus: async (id, status, reason) => {
        const query = `UPDATE transfers SET status = ?, reason = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            connection.query(query, [status, reason, id], (err, results) => {
                if (err) {
                    console.error('Error al actualizar el estado de la transferencia:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    getPending: async () => {
        const query = `SELECT * FROM transfers WHERE status = 'pending'`;
        return new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
                if (err) {
                    console.error('Error al obtener transferencias pendientes:', err);
                    return reject(err);
                }
                console.log('Resultados de getPending:', results);  // Verifica si los resultados se están recuperando
                resolve(results);
            });
        });
    },

    findById: async (id) => {
        const query = 'SELECT * FROM transfers WHERE id = ?';
        return new Promise((resolve, reject) => {
            connection.query(query, [id], (err, results) => {
                if (err) {
                    console.error('Error al obtener la transferencia por ID:', err);
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve(null); // No se encontró la transferencia
                }
                resolve(results[0]); // Devuelve el primer resultado si se encuentra
            });
        });
    },

    findByStatus: async (status) => {
        const query = 'SELECT * FROM transfers WHERE status = ?';
        return new Promise((resolve, reject) => {
            connection.query(query, [status], (err, results) => {
                if (err) {
                    console.error('Error al obtener transferencias por estado:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },
};

module.exports = Transfer;
