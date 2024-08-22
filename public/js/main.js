document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessageDiv = document.getElementById('error-message');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);

        if (data.user.role === 'admin') {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/user-dashboard';
        }
    } catch (err) {
        console.error('Error en la autenticación:', err);
        errorMessageDiv.textContent = err.message;
        errorMessageDiv.style.display = 'block';
    }
});

