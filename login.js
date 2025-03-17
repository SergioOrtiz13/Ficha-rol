document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
        localStorage.setItem('username', username);
        window.location.href = result.redirectUrl;
    } else {
        document.getElementById('error-message').textContent = result.message;
    }
});

