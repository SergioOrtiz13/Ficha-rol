const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { authenticateUser } = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isAuthenticated = await authenticateUser(username, password);

    if (isAuthenticated) {
        res.json({ success: true, redirectUrl: getRedirectUrl(username) });
    } else {
        res.json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }
});

function getRedirectUrl(username) {
    if (username === 'Sergio') {
        return 'dashboard.html';
    } else if (username === 'Kike') {
        return 'ficha.html';
    } else {
        return 'ficha-ambar.html';
    }
}

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});