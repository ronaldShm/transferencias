// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAllTransfers();
    await fetchUsers();
    await fetchPendingTransfers();
    await getAdminData();
});

// 1. Manejo de Usuarios
// ----------------------------------------------------
async function fetchUsers() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 403) {
            alert('Acceso denegado: Solo los administradores pueden acceder a esta página');
            window.location.href = '/';
            return;
        }

        if (!res.ok) {
            throw new Error(`Error en la solicitud: ${res.status} ${res.statusText}`);
        }

        const users = await res.json();
        console.log('Tipo de data recibida:', Array.isArray(users) ? 'Array' : typeof users);

        if (!Array.isArray(users)) {
            throw new Error('La respuesta no es un arreglo de usuarios');
        }

        const tableBody = document.querySelector('#usersTable tbody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.balance}</td>
                <td>
                    <input type="number" id="balance-${user.id}" value="0">
                    <button onclick="updateBalance(${user.id})">Actualizar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        alert('Error al obtener usuarios. Por favor, intenta nuevamente más tarde.');
    }
}

async function updateBalance(userId) {
    const newBalance = document.getElementById(`balance-${userId}`).value;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/update-balance', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: userId, balance: newBalance })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        const data = await res.json();
        alert(`Saldo actualizado con éxito. Nuevo saldo: ${data.newBalance}`);
    } catch (err) {
        console.error('Error al actualizar saldo:', err);
        alert('Error al actualizar saldo: ' + err.message);
    }
}

document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ first_name, last_name, email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMessageDiv.textContent = data.message || 'Error al crear el usuario.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        successMessageDiv.textContent = 'Usuario creado con éxito.';
        successMessageDiv.style.display = 'block';
        document.getElementById('createUserForm').reset();

        setTimeout(() => {
            successMessageDiv.style.display = 'none';
        }, 3000);

    } catch (err) {
        console.error('Error al crear el usuario:', err);
        errorMessageDiv.textContent = 'Error en la solicitud. Por favor, intenta nuevamente.';
        errorMessageDiv.style.display = 'block';
    }
});

// 2. Manejo de Transferencias Pendientes
// ----------------------------------------------------
async function fetchPendingTransfers() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/transfers/pending', {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            throw new Error('Error al obtener transferencias pendientes');
        }

        const transfers = await res.json();
        console.log('Transferencias pendientes en el frontend:', transfers);

        if (!Array.isArray(transfers)) {
            throw new Error('La respuesta no es un arreglo de transferencias');
        }

        const tableBody = document.querySelector('#pendingTransfersTable tbody');
        tableBody.innerHTML = '';

        transfers.forEach(transfer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transfer.id}</td>
                <td>${transfer.sender_id}</td>
                <td>${transfer.receiver_id}</td>
                <td>${transfer.amount}</td>
                <td>
                    <button onclick="approveTransfer(${transfer.id})">Aprobar</button>
                    <button onclick="rejectTransfer(${transfer.id})">Rechazar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error en el frontend al obtener transferencias pendientes:', err);
    }
}

async function approveTransfer(transferId) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/transfers/approve', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ transferId, status: 'approved' })
        });

        const data = await res.json();
        if (res.status === 200) {
            alert(data.message);
            fetchPendingTransfers(); // Refrescar la lista de transferencias
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error al aprobar la transferencia:', err);
    }
}

async function rejectTransfer(transferId) {
    const reason = prompt('Motivo del rechazo:');

    if (!reason) {
        alert('Debe proporcionar un motivo para rechazar la transferencia.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/transfers/approve', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ transferId, status: 'rejected', reason })
        });

        const data = await res.json();
        if (res.status === 200) {
            alert(data.message);
            fetchPendingTransfers(); // Refrescar la lista de transferencias
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error al rechazar la transferencia:', err);
    }
}

// 3. Manejo de Transferencias Generales
// ----------------------------------------------------
async function fetchAllTransfers() {
    try {
        console.log('Iniciando fetchAllTransfers...');

        const token = localStorage.getItem('token');
        console.log('Token obtenido:', token);

        const res = await fetch('/api/transfers/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Respuesta obtenida:', res);

        const responseText = await res.text();
        console.log('Contenido de la respuesta en texto:', responseText);

        if (!responseText) {
            throw new Error('La respuesta del servidor está vacía.');
        }

        const transfers = JSON.parse(responseText);
        console.log('Contenido de la respuesta en JSON:', transfers);

        if (!Array.isArray(transfers)) {
            throw new Error('La respuesta no es un arreglo de transferencias');
        }

        const tableBody = document.querySelector('#pendingTransfersTable tbody');
        tableBody.innerHTML = '';

        transfers.forEach(transfer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transfer.id}</td>
                <td>${transfer.sender_id}</td>
                <td>${transfer.receiver_id}</td>
                <td>${transfer.amount}</td>
                <td>${transfer.status}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error en fetchAllTransfers:', err);
    }
}

// 4. Manejo de Sesión de Administrador
// ----------------------------------------------------
async function getAdminData() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(`Error al obtener los datos del administrador: ${errorMessage}`);
        }

        const userData = await res.json();
        console.log('Datos del administrador:', userData);

        // Mostrar los datos del administrador en la interfaz
    } catch (err) {
        console.error('Error al obtener los datos del administrador:', err);
        alert('Error al obtener los datos del administrador: ' + err.message);
    }
}

document.getElementById('adminLogoutButton').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});
