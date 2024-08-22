
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessageDiv = document.getElementById('error-message');

    try {
        // Realizar la solicitud de autenticación
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Verificar si la solicitud fue exitosa
        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        // Parsear la respuesta en JSON
        const data = await res.json();

        // Almacenar el token en el localStorage
        localStorage.setItem('token', data.token);

        // Redirigir al usuario basado en su rol
        if (data.user.role === 'admin') {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/user-dashboard';
        }
    } catch (err) {
        // Manejo de errores en la autenticación
        console.error('Error en la autenticación:', err);
        errorMessageDiv.textContent = err.message;
        errorMessageDiv.style.display = 'block';
    }
});
