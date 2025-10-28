//server.js
const express = require('express');
const { ObjectId, Admin } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');


const { connectDB, authenticateUser, actualizarTiradas, getRedirectUrl } = require('./db');
const { saveFicha, getFichas, getFichaPorNombre } = require('./db');
const Tirada = require('./models/tirada');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const port = 3000;
const JWT_SECRET = 'Roleplay';



function verificarToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
}

// Multer configuración
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileType = file.mimetype.split('/')[0];
        if (fileType === 'video') cb(null, 'vid');
        else if (fileType === 'image') cb(null, 'img');
        else cb(new Error('Tipo de archivo no válido'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const archivoPath = path.join(__dirname, '/fichaModel.js');
fs.access(archivoPath, fs.constants.F_OK, (err) => {
    if (err) console.log(`${archivoPath} no existe.`);
    else console.log(`${archivoPath} existe.`);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/vid', express.static(path.join(__dirname, 'vid')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isAuthenticated = await authenticateUser(username, password);

if (isAuthenticated) {
    const database = await connectDB();
    const user = await database.collection('usuario').findOne({ username });

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const redirectUrl = await getRedirectUrl(username);
    const token = jwt.sign(
        { username: user.username, role: user.role || 'user' }, // Incluye el role en el token
        JWT_SECRET,
        { expiresIn: '100y' }
    );

    res.json({ success: true, redirectUrl, token });
}
});

// Crear ficha protegida con token
app.post('/crear-ficha', verificarToken, upload.fields([
    { name: 'imagenPersonaje', maxCount: 1 },
    { name: 'videoFondo', maxCount: 1 }
]), async (req, res) => {
    let videoFondoUrl = '';

    if (req.files['videoFondo']) {
        const file = req.files['videoFondo'][0];
        const ext = path.extname(file.originalname).toLowerCase();

        if (['.mp4', '.avi', '.mov', '.webm'].includes(ext)) {
            videoFondoUrl = '/vid/' + file.filename;
        } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            videoFondoUrl = '/img/' + file.filename;
        } else {
            return res.status(400).json({ success: false, message: 'El archivo no es válido.' });
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
        videoFondo: videoFondoUrl,
        creadoPor: req.user.username // <-- Aquí se asocia la ficha al usuario autenticado
    };

    try {
        await saveFicha(fichaData);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.get('/getFichas', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];  // Obtener token del header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);  // Verificar el token
        const username = decoded.username;  // Obtener el username desde el token
        const role = decoded.role;  // Obtener el rol del usuario desde el token (ej: "admin")

        console.log(`Token verificado. Usuario: ${username}, Rol: ${role}`);

        const database = await connectDB();
        const collection = database.collection('fichas');

        let fichas;

        // Si el usuario es admin, obtén todas las fichas, si no, solo las suyas
        if (role === 'admin') {
            fichas = await collection.find({}).toArray();  // Obtener todas las fichas
        } else {
            fichas = await collection.find({ creadoPor: username }).toArray();  // Solo fichas creadas por el usuario
        }

        res.json(fichas);  // Enviar las fichas encontradas
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
    let fichaData = req.body;  // Los datos enviados desde el cliente

    // Lista de propiedades permitidas para la actualización
    const allowedFields = [
        'carisma', 'economia', 'torpeza', 'belleza', 'social', 'habilidades', 
        'historia', 'personalidad', 'habilidadesAdquiridas', 'miembrosArbol', 
        'imagenPersonaje', 'videoFondo', 'crush', 'aristas', 'pv'
    ];

    // Filtramos los datos para solo permitir los campos válidos
    const filteredFichaData = Object.keys(fichaData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
            obj[key] = fichaData[key];
            return obj;
        }, {});

    try {
        const database = await connectDB();
        const collection = database.collection('fichas');

        const updatedFicha = await collection.updateOne(
            { _id: new ObjectId(id) },  // Buscar por ID de ficha
            {
                $set: filteredFichaData  // Solo actualizar los campos permitidos
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

app.post('/guardar-tirada', async (req, res) => {
    const { username, resultados } = req.body;

    if (!Array.isArray(resultados)) {
        return res.status(400).json({ success: false, message: 'Los resultados deben ser un array.' });
    }

    try {
        const database = await connectDB();
        const tiradasCollection = database.collection('tiradas');
        const usuarioCollection = database.collection('usuario');

        // Buscar el usuario en la colección 'usuario' para obtener el username
        const usuario = await usuarioCollection.findOne({ username });

        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        // Si el usuario existe, obtenemos su nombre y almacenamos la tirada
        const nuevaTirada = {
            username: usuario.username,  // Aquí se asegura que el username es correcto
            resultado: resultados,
            fecha: new Date()
        };

        // Verificar cuántas tiradas tiene el usuario
        const tiradas = await tiradasCollection.find({ username: usuario.username }).toArray();

        // Si el usuario tiene 3 tiradas, eliminamos la más antigua
        if (tiradas.length >= 3) {
            const tiradaMasAntigua = tiradas[tiradas.length - 1]; // La última tirada es la más antigua
            await tiradasCollection.deleteOne({ _id: tiradaMasAntigua._id });
        }

        // Guardamos la nueva tirada
        await tiradasCollection.insertOne(nuevaTirada);
        res.status(200).json({ success: true, message: 'Tirada guardada correctamente.' });
        io.emit('tiradaRecibida', {
            username: usuario.username,
            resultado: resultados
        });
    } catch (error) {
        console.error('Error al guardar la tirada:', error);
        res.status(500).json({ success: false, message: 'Error al guardar la tirada.' });
    }
});

app.get('/tiradas/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const database = await connectDB();
        const collection = database.collection('tiradas');

        const tiradas = await collection.find({ username })
            .sort({ fecha: -1 }) 
            .toArray();

        res.json(tiradas);
    } catch (error) {
        console.error('Error al obtener tiradas:', error);
        res.status(500).json({ error: 'Error al obtener tiradas' });
    }
});

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

// Actualizar la imagenPorDefecto de todas las fichas
app.put('/actualizar-imagen-por-defecto', async (req, res) => {
    try {
        const { nuevaImagen } = req.body;

        if (!nuevaImagen) {
            return res.status(400).json({ success: false, message: 'No se proporcionó la imagen' });
        }

        const database = await connectDB();
        const collection = database.collection('fichas');

        const result = await collection.updateMany({}, { $set: { imagenPorDefecto: nuevaImagen } });

        // Emitir evento a todos los clientes conectados
        console.log('🔁 Emitiendo imagenPorDefectoActualizada:', nuevaImagen);
        io.emit('imagenPorDefectoActualizada', { nuevaImagen });

        return res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error al actualizar la imagen por defecto:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});


io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('nuevaTirada', async (data) => {
        const { username, resultado } = data;

        // Guardar en la base de datos
        try {
            await guardarTirada(data);
            console.log(`Tirada guardada para ${username}`);
        } catch (error) {
            console.error('Error al guardar la tirada:', error);
        }

        // Emitir solo la última tirada de cada usuario
        io.emit('tiradaRecibida', { username, resultado });
    });
});

http.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});