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

// Función para guardar o actualizar características en la base de datos
async function actualizarCaracteristicas(fichaId, caracteristicas) {
    try {
        const database = await connectDB();
        const collection = database.collection('fichas');
        const result = await collection.updateOne(
            { _id: fichaId },
            { $set: { caracteristicas: caracteristicas } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error al actualizar características:', error);
        throw error;
    } finally {
        await closeDB();
    }
}

// Función para obtener las características de una ficha
async function obtenerCaracteristicas(fichaId) {
    try {
        const database = await connectDB();
        const collection = database.collection('fichas');
        const ficha = await collection.findOne({ _id: fichaId });

        if (ficha && ficha.caracteristicas) {
            return ficha.caracteristicas;
        } else {
            console.error('Ficha no encontrada o sin características.');
            return null;
        }
    } catch (error) {
        console.error('Error al obtener las características:', error);
        throw error;
    } finally {
        await closeDB();
    }
}

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

// Función para obtener una ficha por nombre de personaje
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

// Función para obtener todas las fichas de un usuario específico
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
    actualizarCaracteristicas,
    obtenerCaracteristicas,
    getRedirectUrl,
    closeDB
};