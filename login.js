document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Usuarios y contraseñas predefinidos
    var predefinedUsers = {
        'Kike': 'Kike1111',
        'Sergio': 'Sergio12345'
    };

    if (predefinedUsers[username] && predefinedUsers[username] === password) {
        if (username === 'Sergio') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'ficha.html';
        }
    } else {
        document.getElementById('error-message').textContent = 'Usuario o contraseña incorrectos.';
    }
});