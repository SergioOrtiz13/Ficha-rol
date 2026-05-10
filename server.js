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

    if (fileType === 'video') {

        cb(null, 'vid');

    } else if (fileType === 'image') {

        cb(null, 'img');

    } else if (fileType === 'audio') {

        cb(null, 'music/movile');

    } else {

        cb(new Error('Tipo de archivo no válido'));

    }

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
app.use('/music', express.static(path.join(__dirname, 'music')));

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
        creadoPor: req.user.username, // <-- Aquí se asocia la ficha al usuario autenticado
        armadura: "7"
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
        'imagenPersonaje', 'videoFondo', 'crush', 'aristas', 'pv', 'dinero'
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

app.get('/tiradas', async (req, res) => {
    try {
        const database = await connectDB();
        const collection = database.collection('tiradas');

        const tiradas = await collection
            .find({})
            .sort({ fecha: -1 })
            .toArray();

        const resultado = {};

        tiradas.forEach(t => {
            if (!resultado[t.username]) {
                resultado[t.username] = [];
            }

            if (resultado[t.username].length < 3) {
                resultado[t.username].push(t);
            }
        });

        res.json(resultado);

    } catch (error) {
        console.error('Error al obtener tiradas globales:', error);
        res.status(500).json({ error: 'Error al obtener tiradas' });
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

app.get('/music-list', (req, res) => {
    const musicDir = path.join(__dirname, 'music');

    fs.readdir(musicDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'No se pudo leer la carpeta music' });
        }

        // filtramos solo audios
        const songs = files.filter(file =>
            file.endsWith('.mp3') ||
            file.endsWith('.wav') ||
            file.endsWith('.ogg')
        );

        res.json(songs);
    });
});

app.get('/contacts/:id', verificarToken, async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('fichas');

        const ficha = await collection.findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!ficha) return res.status(404).json([]);

        res.json(ficha.contacts || []);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.post('/contacts/:id/add', verificarToken, async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Nombre requerido' });
    }

    try {
        const db = await connectDB();
        const fichas = db.collection('fichas');

        const personaje = await fichas.findOne({
            nombrePersonaje: name
        });

        const contact = personaje
            ? {
                name: personaje.nombrePersonaje,
                isCharacter: true,
                image: personaje.imagenPersonaje || ''
            }
            : {
                name,
                isCharacter: false,
                image: ''
            };

        // 🔥 PASO 1: asegurar que contacts existe
        await fichas.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $setOnInsert: { contacts: [] }
            },
            { upsert: false }
        );

        // 🔥 PASO 2: evitar duplicados correctamente
        const result = await fichas.updateOne(
            {
                _id: new ObjectId(req.params.id),
                "contacts.name": { $ne: name }
            },
            {
                $push: { contacts: contact }
            }
        );

        return res.json({
            success: true,
            modified: result.modifiedCount,
            contact
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al añadir contacto' });
    }
});


app.post('/contacts/:id/delete', verificarToken, async (req, res) => {
    const { name } = req.body;

    try {
        const db = await connectDB();
        const collection = db.collection('fichas');

        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $pull: {
                    contacts: { name }
                }
            }
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al borrar contacto' });
    }
});

app.get('/messages/:from/:to', async (req, res) => {

    const { from, to } = req.params;

    try {

        const db = await connectDB();

        const messages = await db.collection('chats')
            .find({
                $or: [
                    {
                        from: from,
                        to: to
                    },
                    {
                        from: to,
                        to: from
                    }
                ]
            })
            .sort({ createdAt: 1 })
            .toArray();

        res.json(messages);

    } catch (err) {

        console.error(err);

        res.status(500).json([]);
    }
});

app.get('/chat-list/:personaje', async (req, res) => {

    const { personaje } = req.params;

    try {

        const db = await connectDB();

        const messages = await db.collection('chats')
            .find({
                $or: [
                    { from: personaje },
                    { to: personaje }
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();

        const uniqueChats = [];

        messages.forEach(msg => {

            const otherUser =
                msg.from === personaje
                    ? msg.to
                    : msg.from;

            const exists = uniqueChats.find(
                c => c.name === otherUser
            );

            if (!exists) {

                uniqueChats.push({
                    name: otherUser,
                    isCharacter: false,
                    image: '',
                    unknown: true
                });
            }
        });

        res.json(uniqueChats);

    } catch (err) {

        console.error(err);

        res.status(500).json([]);
    }
});

app.post('/upload-chat-image',upload.single('image'), async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    success:false
                });
            }

            res.json({
                success:true,
                image:'/img/' + req.file.filename
            });

        } catch(err) {

            console.error(err);

            res.status(500).json({
                success:false
            });
        }
});

app.post('/upload-music/:id',upload.single('music'),async (req, res) => {

        try {

            const db = await connectDB();

            const { id } = req.params;

            if (!req.file) {

                return res.status(400).json({
                    success:false
                });

            }

            const musicData = {

                name:req.file.originalname,

                url:'/music/' + req.file.filename

            };

            await db.collection('fichas').updateOne(
                { _id:new ObjectId(id) },
                {
                    $push:{
                        musicas:musicData
                    }
                }
            );

            res.json({
                success:true,
                music:musicData
            });

        } catch(err) {

            console.error(err);

            res.status(500).json({
                success:false
            });
        }
    }
);

app.get('/music/:id', async (req,res) => {

    try {

        const db = await connectDB();

        const ficha = await db.collection('fichas').findOne({
            _id:new ObjectId(req.params.id)
        });

        res.json(ficha.musicas || []);

    } catch(err) {

        console.error(err);

        res.status(500).json([]);
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

app.put('/guardar-phone-settings/:id', upload.single('image'), async (req, res) => {

    try {

        const { id } = req.params;

        const db = await connectDB();

        const updateData = {
            phoneBackgroundColor: req.body.phoneBackgroundColor || "#111111"
        };

        // 👉 SI SUBES IMAGEN → activas imagen y borras color visual
        if (req.file) {

            updateData.phoneBackgroundImage = '/img/' + req.file.filename;
            updateData.phoneBackgroundMode = "image";

        } else {

            // 👉 SI NO HAY IMAGEN → borras la anterior
            updateData.phoneBackgroundImage = "";
            updateData.phoneBackgroundMode = "color";
        }

        await db.collection('fichas').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.get('/phone-settings/:id', async (req, res) => {

    try {

        const db = await connectDB();

        const ficha = await db.collection('fichas').findOne({
            _id: new ObjectId(req.params.id)
        });

        // 🔥 AUTO-INICIALIZAR si no existen
        const update = {};

        if (!ficha.phoneBackgroundMode) {
            update.phoneBackgroundMode = 'color';
        }

        if (!ficha.phoneBackgroundColor) {
            update.phoneBackgroundColor = '#111111';
        }

        if (!ficha.phoneBackgroundImage) {
            update.phoneBackgroundImage = '';
        }

        if (Object.keys(update).length > 0) {

            await db.collection('fichas').updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: update }
            );
        }

        res.json({
            phoneBackgroundMode: ficha.phoneBackgroundMode || 'color',
            phoneBackgroundColor: ficha.phoneBackgroundColor ?? null,
            phoneBackgroundImage: ficha.phoneBackgroundImage || ''
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({});
    }
});

app.get('/ficha-by-id/:id', async (req, res) => {

    try {

        const db = await connectDB();

        const ficha = await db.collection('fichas').findOne({
            _id: new ObjectId(req.params.id)
        });

        res.json(ficha);

    } catch (err) {

        console.error(err);

        res.status(500).json(null);
    }
});

app.get('/gallery/:personaje', async (req,res) => {

    try {

        const db = await connectDB();

        const images = await db.collection('gallery')
            .find({
                owner:req.params.personaje
            })
            .sort({ createdAt:-1 })
            .toArray();

        res.json(images);

    } catch(err) {

        console.error(err);

        res.status(500).json([]);
    }
});

app.put('/actualizar-dinero/:id', async (req, res) => {
    const { id } = req.params;
    const { dinero } = req.body;

    if (dinero === undefined) {
        return res.status(400).json({ success: false, message: 'Dinero no proporcionado' });
    }

    try {
        const database = await connectDB();
        const collection = database.collection('fichas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { dinero: parseFloat(dinero) } }
        );

        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error al actualizar dinero:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar dinero' });
    }
});


io.on('connection', (socket) => {

    console.log('Cliente conectado');

    // ======================
    // CHAT
    // ======================

socket.on('sendMessage', async (data) => {

    try {

        const db = await connectDB();

        const message = {
            from: data.from,
            to: data.to,
            text: data.text || '',
            image: data.image || '',
            createdAt: new Date()
        };

        await db.collection('chats').insertOne(message);

        if (data.image) {

    await db.collection('gallery').insertOne({
        owner: data.to,
        from: data.from,
        image: data.image,
        createdAt: new Date()
    });
}

        io.emit('newMessage', message);

    } catch (err) {

        console.error(err);
    }
});

    // ======================
    // TIRADAS
    // ======================

    socket.on('nuevaTirada', async (data) => {

        const { username, resultado } = data;

        io.emit('tiradaRecibida', {
            username,
            resultado
        });
    });

    // ======================
    // MUSIC
    // ======================

    socket.on('playMusic', (data) => {
        io.emit('playMusic', data);
    });

    socket.on('stopMusic', () => {
        io.emit('stopMusic');
    });

});

http.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
