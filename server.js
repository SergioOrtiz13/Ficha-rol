const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB , authenticateUser, actualizarTiradas, actualizarHabilidades } = require('./db');
const { saveFicha, getFichas, getFichaPorNombre } = require('./fichaModel');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

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

app.post('/crear-ficha', async (req, res) => {
    try {
        const fichaData = req.body;  // Recibimos los datos de la ficha desde el frontend

        // Guardamos la ficha en la base de datos
        const result = await saveFicha(fichaData);

        // Respondemos al cliente con éxito
        res.json({ success: true, message: 'Ficha creada con éxito', data: result });
    } catch (error) {
        res.json({ success: false, message: 'Error al guardar la ficha', error: error.message });
    }
});

app.get('/getFichas', async (req, res) => {
    try {
        const fichas = await getFichas();  // Obtener fichas desde MongoDB
        res.json(fichas);  // Enviar las fichas en formato JSON
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        res.status(500).json({ message: 'Error al obtener las fichas' });
    }
});

app.get('/ficha/:nombrePersonaje', async (req, res) => {
    const { nombrePersonaje } = req.params;  // Obtienes el nombre del personaje desde la URL
    try {
        const ficha = await getFichaPorNombre(nombrePersonaje);  // Obtener ficha desde MongoDB

        if (ficha) {
            // Renderizar la plantilla EJS y pasar los datos de la ficha
            res.render('base', { personaje: ficha });  // 'base' es el nombre del archivo EJS
        } else {
            res.status(404).json({ message: 'Ficha no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la ficha:', error);
        res.status(500).json({ message: 'Error al obtener la ficha' });
    }
});

app.get('/ficha/:id', (req, res) => {
    // Aquí debes obtener los datos del personaje de la base de datos
    const personajeId = req.params.id;

    // Obtener el personaje de la base de datos
    // Supongamos que obtienes el personaje en la variable `personaje`
    db.collection('fichas').findOne({ _id: new ObjectId(personajeId) }, (err, personaje) => {
        if (err) {
            return res.status(500).send("Error al obtener los datos del personaje");
        }

        // Renderizar la vista EJS con los datos del personaje
        res.render('ficha', { personaje });
    });
});

app.post('/actualizar-tiradas', async (req, res) => {
    const { username, tiradas } = req.body;  // Recibimos el nombre de usuario y las tiradas

    if (!Array.isArray(tiradas)) {
        return res.status(400).json({ success: false, message: 'Las tiradas deben ser un array.' });
    }

    try {
        // Actualizar las tiradas del usuario
        const result = await actualizarTiradas(username, tiradas);

        // Asegúrate de que 'result' siempre sea un objeto antes de acceder a sus propiedades
        if (result && result.matchedCount > 0) {
            res.json({ success: true, message: 'Tiradas actualizadas correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar las tiradas:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar las tiradas.' });
    }
});



// Ruta para actualizar las habilidades adquiridas de un usuario
app.post('/actualizar-habilidades', async (req, res) => {
    const { username, habilidades_adquiridas } = req.body;

    if (!username || !habilidades_adquiridas) {
        return res.status(400).json({ success: false, message: 'Faltan datos: username o habilidades.' });
    }

    try {
        // Actualizar las habilidades del usuario en la base de datos
        const result = await actualizarHabilidades(username, habilidades_adquiridas);

        if (result) {
            res.json({ success: true, message: 'Habilidades actualizadas correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar las habilidades:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar las habilidades.' });
    }
});

// Ruta para obtener las habilidades adquiridas de un usuario
app.get('/get-habilidades/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const database = await connectDB();
        const collection = database.collection('usuario');
        const user = await collection.findOne({ username });

        if (user) {
            // Usar el campo correcto 'habilidadesAdquiridas'
            console.log('Habilidades adquiridas:', user.habilidadesAdquiridas);
            res.json({ success: true, habilidades_adquiridas: user.habilidadesAdquiridas || '' });
        } else {
            console.log('Usuario no encontrado:', username);
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener las habilidades adquiridas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las habilidades adquiridas' });
    }
});

app.get('/habilidades/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const database = await connectDB();
        const collection = database.collection('usuario');
        
        // Buscar el usuario por el nombre de usuario
        const user = await collection.findOne({ username: username });

        if (user) {
            res.json({ success: true, habilidadesAdquiridas: user.habilidadesAdquiridas });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener las habilidades:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las habilidades' });
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