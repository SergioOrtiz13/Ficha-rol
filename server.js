const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { connectDB , authenticateUser, actualizarTiradas, actualizarHabilidades } = require('./db');
const { saveFicha, getFichas, getFichaPorNombre } = require('./db');
const fs = require('fs');

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
        res.json({ success: true, redirectUrl: getRedirectUrl(username) });
    } else {
        res.json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }
});

app.post('/crear-ficha', upload.fields([
    { name: 'imagenPersonaje', maxCount: 1 },
    { name: 'videoFondo', maxCount: 1 }
]), async (req, res) => {
    let videoFondoUrl = '';
    
    // Verificar si se subió un archivo en 'videoFondo'
    if (req.files['videoFondo']) {
        const file = req.files['videoFondo'][0];
        const ext = path.extname(file.originalname).toLowerCase(); // Obtener la extensión del archivo

        // Si es un video o una imagen, generar la URL correspondiente
        if (ext === '.mp4' || ext === '.avi' || ext === '.mov' || ext === '.webm') {
            videoFondoUrl = '/vid/' + file.filename; // Es un video
        } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
            videoFondoUrl = '/img/' + file.filename; // Es una imagen
        } else {
            return res.status(400).json({ success: false, message: 'El archivo no es un video ni una imagen válida.' });
        }
    }

    // Crear los datos de la ficha
    const fichaData = {
        nombrePersonaje: req.body.nombrePersonaje,
        carisma: req.body.carisma,
        economia: req.body.economia,
        torpeza: req.body.torpeza,
        belleza: req.body.belleza,
        social: req.body.social,
        historia: req.body.historia,
        personalidad: req.body.personalidad,
        habilidadesAdquiridas: req.body.habilidadesAdquiridas,
        miembrosArbol: JSON.parse(req.body.miembrosArbol),
        habilidades: req.body.habilidades,
        imagenPersonaje: req.files['imagenPersonaje'] ? '/img/' + req.files['imagenPersonaje'][0].filename : '',
        videoFondo: videoFondoUrl // Asignar la URL de video o imagen al campo 'videoFondo'
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
        const fichas = await getFichas();  // Obtener fichas desde MongoDB
        res.json(fichas);  // Enviar las fichas en formato JSON
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        res.status(500).json({ message: 'Error al obtener las fichas' });
    }
});

app.get('/ficha/:nombrePersonaje', async (req, res) => {
    try {
        const { nombrePersonaje } = req.params;
        
        // Obtener una ficha por nombre desde MongoDB
        const ficha = await getFichaPorNombre(nombrePersonaje);

        if (!ficha) {
            return res.status(404).send('Ficha no encontrada');
        }

        // Renderiza la plantilla base.ejs y pasa la ficha individual
        res.render('base', { personaje: ficha });
    } catch (error) {
        console.error('Error al obtener la ficha:', error);
        res.status(500).send('Error al obtener la ficha');
    }
});

// Ruta para obtener y renderizar todas las fichas
app.get('/fichas', async (req, res) => {
    try {
        // Obtener todas las fichas desde MongoDB
        const fichas = await getFichas();  // Devuelve todas las fichas

        if (!fichas || fichas.length === 0) {
            return res.status(404).send('No se encontraron fichas');
        }

        // Renderiza la plantilla fichas.ejs y pasa todas las fichas
        res.render('fichas', { fichas });
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        res.status(500).send('Error al obtener las fichas');
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

app.post('/upload', upload.fields([
    { name: 'imagenPersonaje', maxCount: 1 },
    { name: 'videoFondo', maxCount: 1 }
]), (req, res) => {
    const imagenUrl = req.files['imagenPersonaje'] ? `/img/fotos/${req.files['imagenPersonaje'][0].filename}` : null;
    const videoUrl = req.files['videoFondo'] ? `/vid/${req.files['videoFondo'][0].filename}` : null;

    // Guardar las URLs en la base de datos
    const fichaData = {
        nombrePersonaje: req.body.nombrePersonaje,
        imagenPersonaje: imagenUrl,
        videoFondo: videoUrl
    };

    // Llamar a tu función de base de datos para guardar los datos
    saveFicha(fichaData)
        .then(() => res.send('Ficha guardada con éxito'))
        .catch(err => res.status(500).send('Error al guardar la ficha'));
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

app.get('/get-caracteristicas/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const database = await connectDB();
        const collection = database.collection('usuario');

        const user = await collection.findOne({ username });

        if (user) {
            // Asumiendo que las características están en el campo 'caracteristicasPersonaje'
            res.json({ success: true, caracteristicas: user.caracteristicasPersonaje });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener las características:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las características' });
    }
});

app.post('/actualizar-caracteristica', async (req, res) => {
    const { username, caracteristicas } = req.body;

    console.log('Datos recibidos:', { username, caracteristicas });

    // Verificar si los datos requeridos están presentes
    if (!username || !Array.isArray(caracteristicas) || caracteristicas.length === 0) {
        console.log('Faltan datos:', { username, caracteristicas });
        return res.status(400).json({ success: false, message: 'Faltan datos: username o caracteristicas.' });
    }

    try {
        // Conectar a la base de datos
        const database = await connectDB();
        const collection = database.collection('usuario');

        // Buscar el usuario por el nombre de usuario
        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Obtener las características del usuario
        let caracteristicasPersonaje = user.caracteristicasPersonaje || [];

        // Iterar sobre el array de características recibidas y actualizar los valores
        for (const nuevaCaracteristica of caracteristicas) {
            const { nombre, valor } = nuevaCaracteristica;

            // Verificar si la característica existe en el array
            const caracteristicaEncontrada = caracteristicasPersonaje.find(c => c.nombre === nombre);

            if (caracteristicaEncontrada) {
                // Si la característica existe, actualizamos su valor
                caracteristicaEncontrada.valor = valor;
            } else {
                // Si no existe, agregamos una nueva característica
                caracteristicasPersonaje.push({ nombre, valor });
            }
        }

        // Actualizar las características en la base de datos
        const result = await collection.updateOne(
            { username: username },
            { $set: { caracteristicasPersonaje: caracteristicasPersonaje } }
        );

        if (result.modifiedCount > 0) {
            res.json({ success: true, message: 'Características actualizadas correctamente.' });
        } else {
            res.status(500).json({ success: false, message: 'Hubo un problema al actualizar las características.' });
        }
    } catch (error) {
        console.error('Error al actualizar la característica:', error);
        res.status(500).json({ success: false, message: 'Hubo un error al actualizar la característica.' });
    }
});

app.get('/get-habilidades-y-caracteristicas/:username/:fichaId', async (req, res) => {
    const { username, fichaId } = req.params;
    try {
        const ficha = await getFichaPorId(fichaId);  // Obtener la ficha por ID
        if (ficha && ficha.username === username) {
            res.json({
                success: true,
                habilidades_adquiridas: ficha.habilidadesAdquiridas || '',
                caracteristicas: {
                    carisma: ficha.carisma,
                    economia: ficha.economia,
                    torpeza: ficha.torpeza,
                    belleza: ficha.belleza,
                    social: ficha.social,
                    historia: ficha.historia,
                    personalidad: ficha.personalidad,
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Ficha o usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener habilidades y características:', error);
        res.status(500).json({ success: false, message: 'Error al obtener habilidades y características' });
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