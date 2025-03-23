const express = require('express');
const { ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { connectDB, authenticateUser, actualizarTiradas, getRedirectUrl } = require('./db');  // Usamos getRedirectUrl desde db.js
const { saveFicha, getFichas, getFichaPorNombre } = require('./db');
const fs = require('fs');
const io = socketIo(server);

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileType = file.mimetype.split('/')[0]; // Esto determina el tipo de archivo (image o video)
        
        if (fileType === 'video') {
            cb(null, 'vid');  // Guardar videos en la carpeta 'vid'
        } else if (fileType === 'image') {
            cb(null, 'img');  // Guardar imágenes en la carpeta 'img'
        } else {
            cb(new Error('Tipo de archivo no válido'));  // Si no es ni imagen ni video
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Nombre único para el archivo
    }
});

const upload = multer({ storage: storage });
const archivoPath = path.join(__dirname, '/fichaModel.js');
fs.access(archivoPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.log(`${archivoPath} no existe.`);
    } else {
        console.log(`${archivoPath} existe.`);
    }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/vid', express.static(path.join(__dirname, 'vid')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isAuthenticated = await authenticateUser(username, password);

    if (isAuthenticated) {
        // Aquí llamamos a la función getRedirectUrl desde db.js para obtener la URL de redirección
        const redirectUrl = await getRedirectUrl(username);  // Esta función devuelve la URL correcta

        // Aquí generamos un token (si lo estás utilizando), o puedes eliminarlo si no es necesario
        const token = 'some-jwt-token';  // Aquí deberías usar un generador de tokens real (JWT)

        // Responder con el redirectUrl y token para que el cliente lo use
        res.json({ success: true, redirectUrl, token });
    } else {
        res.json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }
});

app.post('/crear-ficha', upload.fields([
    { name: 'imagenPersonaje', maxCount: 1 },
    { name: 'videoFondo', maxCount: 1 }
]), async (req, res) => {
    let videoFondoUrl = '';

    if (req.files['videoFondo']) {
        const file = req.files['videoFondo'][0];
        const ext = path.extname(file.originalname).toLowerCase();

        if (ext === '.mp4' || ext === '.avi' || ext === '.mov' || ext === '.webm') {
            videoFondoUrl = '/vid/' + file.filename;
        } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
            videoFondoUrl = '/img/' + file.filename;
        } else {
            return res.status(400).json({ success: false, message: 'El archivo no es un video ni una imagen válida.' });
        }
    }

    const fichaData = {
        nombrePersonaje: req.body.nombrePersonaje,
        carisma: req.body.carisma,
        economia: req.body.economia,
        torpeza: req.body.torpeza,
        belleza: req.body.belleza,
        social: req.body.social,
        habilidades: req.body.habilidades, 
        historia: req.body.historia,
        personalidad: req.body.personalidad,
        habilidadesAdquiridas: req.body.habilidadesAdquiridas,
        miembrosArbol: JSON.parse(req.body.miembrosArbol),
        imagenPersonaje: req.files['imagenPersonaje'] ? '/img/' + req.files['imagenPersonaje'][0].filename : '',
        videoFondo: videoFondoUrl
    };

    try {
        await saveFicha(fichaData);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/getFichas', async (req, res) => {
    try {
        const fichas = await getFichas(); 
        res.json(fichas);
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        res.status(500).json({ message: 'Error al obtener las fichas' });
    }
});

app.get('/ficha/:nombrePersonaje', async (req, res) => {
    try {
        const { nombrePersonaje } = req.params;
        const ficha = await getFichaPorNombre(nombrePersonaje);

        if (!ficha) {
            return res.status(404).send('Ficha no encontrada');
        }

        res.render('base', { personaje: ficha });
    } catch (error) {
        console.error('Error al obtener la ficha:', error);
        res.status(500).send('Error al obtener la ficha');
    }
});

// Ruta para obtener todas las fichas
app.get('/fichas', async (req, res) => {
    try {
        const fichas = await getFichas();  // Devuelve todas las fichas

        if (!fichas || fichas.length === 0) {
            return res.status(404).send('No se encontraron fichas');
        }

        res.render('fichas', { fichas });
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        res.status(500).send('Error al obtener las fichas');
    }
});

app.get('/ficha/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const ficha = await db.collection('fichas').findOne({ _id: new ObjectId(id) });

        if (!ficha) {
            return res.status(404).send('Ficha no encontrada');
        }

        res.render('ficha', { personaje: ficha });
    } catch (error) {
        console.error('Error al obtener la ficha:', error);
        res.status(500).send('Error al obtener la ficha');
    }
});

app.put('/actualizar-ficha/:id', async (req, res) => {
    const { id } = req.params;
    const fichaData = req.body;  // Los datos enviados desde el cliente

    try {
        const database = await connectDB();
        const collection = database.collection('fichas');

        const updatedFicha = await collection.updateOne(
            { _id: new ObjectId(id) },  // Buscar por ID de ficha
            {
                $set: fichaData  // Actualizar con los datos recibidos
            }
        );

        if (updatedFicha.modifiedCount === 1) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'No se realizaron cambios en la base de datos' });
        }
    } catch (error) {
        console.error('Error al actualizar la ficha:', error);
        res.status(500).send('Error al actualizar la ficha');
    }
});

// Ruta para actualizar las habilidades adquiridas de un usuario
app.post('/actualizar-tiradas', async (req, res) => {
    const { username, tiradas } = req.body;

    if (!Array.isArray(tiradas)) {
        return res.status(400).json({ success: false, message: 'Las tiradas deben ser un array.' });
    }

    try {
        const result = await actualizarTiradas(username, tiradas);

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

// Ruta para obtener las habilidades adquiridas de un usuario
app.get('/get-habilidades/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const database = await connectDB();
        const collection = database.collection('usuario');
        const user = await collection.findOne({ username });

        if (user) {
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

// Ruta para obtener las características de un usuario
app.get('/get-caracteristicas/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const database = await connectDB();
        const collection = database.collection('usuario');
        const user = await collection.findOne({ username });

        if (user) {
            console.log('Características del usuario:', user.caracteristicas);
            res.json({ success: true, caracteristicas: user.caracteristicas || '' });
        } else {
            console.log('Usuario no encontrado:', username);
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener las características:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las características' });
    }
});

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    // Emite un evento cuando un cambio se realiza
    socket.on('actualizar-ficha', (ficha) => {
        io.emit('ficha-actualizada', ficha);  // Envía la ficha actualizada a todos los clientes
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
