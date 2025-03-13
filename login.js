document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "login.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText); // Añadir esta línea para depuración
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                window.location.href = response.redirect;
            } else {
                document.getElementById('error-message').textContent = response.message;
            }
        }
    };
    xhr.send("username=" + username + "&password=" + password);
});