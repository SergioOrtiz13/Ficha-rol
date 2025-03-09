document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Usuario y contraseña predefinidos (encriptados)
    var predefinedUsername = 'Kike';
    var predefinedPassword = btoa('Kike1111'); 
    if (username === predefinedUsername && btoa(password) === predefinedPassword) {
        window.location.href = 'ficha.html'; // Redirige a ficha.html
    } else {
        document.getElementById('error-message').textContent = 'Usuario o contraseña incorrectos.';
    }
});