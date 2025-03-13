document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "login.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (xhr.responseText.includes("Usuario o contraseña incorrectos.")) {
                document.getElementById('error-message').textContent = xhr.responseText;
            } else {
                window.location.href = xhr.responseText;
            }
        }
    };

    xhr.send("username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password));
});