// db.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://root:root@cluster0.nz9sp.mongodb.net/';
const client = new MongoClient(uri);
const collectionName = 'archivos';

async function connectDB() {
    try {
        await client.connect();
        const database = client.db('Fichas');
        return database;
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error);
        throw error;
    }
}

async function authenticateUser(username, password) {
    try {
        const database = await connectDB();
        const collection = database.collection('usuario');
        const user = await collection.findOne({ username: username });

        if (user && user.Password === password) {
            return true;
        } else {
            return false;
        }
    } finally {
        await closeDB();
    }
}

// Funciones de manejo de fichas

// Función para guardar una ficha y asociarla al usuario
async function saveFicha(fichaData, username) {
    try {
        const database = await connectDB();
        const collection = database.collection('fichas');

        // Agregar el username del usuario a la ficha
        fichaData.usuario = username;

        // Guardar la ficha en la base de datos
        const result = await collection.insertOne(fichaData);
        
        // Si la ficha se guarda correctamente, asociarla al usuario
        const usuarioCollection = database.collection('usuario');
        await usuarioCollection.updateOne(
            { username: username },
            { $push: { fichas: result.insertedId } } // Agregar el ID de la ficha al array "fichas" del usuario
        );

        return result.insertedId;
    } finally {
        await closeDB();
    }
}


// Obtener fichas de un usuario específico
async function getFichas(username) {
    try {
        const database = await connectDB();
        const collection = database.collection('fichas');
        const fichas = await collection.find({ usuario: username }).toArray(); // Filtra por el username
        return fichas;
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        throw error;
    } finally {
        await closeDB();
    }
}


async function getFichaPorNombre(nombrePersonaje) {
    try {
        const database = await connectDB();
        const collection = database.collection('fichas');
        const ficha = await collection.findOne({ "nombrePersonaje": nombrePersonaje });
        return ficha;
    } catch (error) {
        console.error('Error al obtener la ficha por nombre:', error);
        throw error;
    } finally {
        await closeDB();
    }
}

// Funciones adicionales que ya tienes

async function actualizarTiradas(username, nuevasTiradas) {
    try {
        const database = await connectDB();
        const collection = database.collection('usuario');
        const result = await collection.updateOne(
            { username: username },
            { $set: { tiradas: nuevasTiradas } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Las tiradas del usuario ${username} han sido actualizadas correctamente.`);
        }
    } catch (error) {
        console.error('Error al actualizar las tiradas:', error);
    } finally {
        await closeDB();
    }
}

// Aquí podrías seguir integrando las demás funciones de actualización de habilidades, características, etc., de manera similar...

// Función para cerrar la conexión a MongoDB


// Función para guardar el contenido de un archivo JS dentro de una ficha
async function saveFileContentToFicha(fileName, nombrePersonaje) {
    try {
        const filePath = path.join(__dirname, './', fileName);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const fichaData = {
            nombrePersonaje: nombrePersonaje,
            archivoJS: fileContent,
            fecha: new Date()
        };

        const result = await saveFicha(fichaData);
        console.log('Archivo JS guardado y asociado con la ficha:', result);
    } catch (error) {
        console.error('Error al guardar el archivo JS:', error);
    }
}

async function getRedirectUrl(username) {
    try {
        const database = await connectDB();
        const usuariosCollection = database.collection('usuario');
        const usuario = await usuariosCollection.findOne({ username });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const redirectUrl = usuario.redirectUrl;

        // Si el redirectUrl está presente, lo devolvemos
        if (redirectUrl) {
            return redirectUrl;
        } else {
            // Si no tiene redirectUrl, devolvemos una URL por defecto
            return '/dashboard.html';  // Puede ser cualquier URL que desees como valor por defecto
        }

    } catch (error) {
        console.error("Error al obtener el redirectUrl:", error);
        return '/dashboard.html';  // URL por defecto en caso de error
    } finally {
        await client.close();
    }
}

async function closeDB() {
    try {
        await client.close();
    } catch (error) {
        console.error('Error al cerrar la conexión a MongoDB:', error);
    }
}

module.exports = {
    connectDB,
    authenticateUser,
    saveFicha,
    getFichas,
    getFichaPorNombre,
    actualizarTiradas,
    saveFileContentToFicha,
    getRedirectUrl,
    closeDB
};