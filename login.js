document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Usuario y contraseña predefinidos
    var predefinedUsername = 'Kike';
    var predefinedPassword = 'Kike1111';

    if (username === predefinedUsername && password === predefinedPassword) {
        window.location.href = 'ficha.html';
    } else {
        document.getElementById('error-message').textContent = 'Usuario o contraseña incorrectos.';
    }
});