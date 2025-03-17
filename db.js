const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://root:root@cluster0.nz9sp.mongodb.net/';
const client = new MongoClient(uri);

async function connectDB() {
    try {
        // Conéctate directamente al cliente de MongoDB sin la necesidad de comprobar la conexión
        await client.connect();
        const database = client.db('Fichas');
        return database;
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error);
        throw error;
    }
}

async function closeDB() {
    try {
        await client.close();
    } catch (error) {
        console.error('Error al cerrar la conexión a MongoDB:', error);
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

async function saveFicha(fichaData) {
    try {
        const database = await connectDB();
        const collection = database.collection('fichas');

        const result = await collection.insertOne(fichaData);
        return result.insertedId; 
    } finally {
        await closeDB();
    }
}

async function actualizarTiradas(username, nuevasTiradas) {
    try {
        // Conectar a la base de datos
        const database = await connectDB();
        const collection = database.collection('usuario');
        
        // Actualizar las tiradas del usuario
        const result = await collection.updateOne(
            { username: username },  // Buscar por el 'username' único
            { $set: { tiradas: nuevasTiradas } } // Actualizar solo las tiradas
        );

        // Imprimir el resultado de la actualización para depuración
        console.log('Resultado de la actualización:', result);

        // Verifica que el resultado no sea undefined antes de acceder a sus propiedades
        if (result && result.modifiedCount > 0) {
            console.log(`Las tiradas del usuario ${username} han sido actualizadas correctamente.`);
        } else if (result && result.matchedCount > 0) {
            console.log(`Las tiradas del usuario ${username} ya estaban actualizadas.`);
        } else {
            console.log(`No se encontró el usuario ${username} o no se hizo ninguna modificación.`);
        }
    } catch (error) {
        console.error('Error al actualizar las tiradas:', error);
    } finally {
        await closeDB();
    }
}

module.exports = { authenticateUser, saveFicha, actualizarTiradas };
