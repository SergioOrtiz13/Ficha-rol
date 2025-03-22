/*const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://root:root@cluster0.nz9sp.mongodb.net/';
const client = new MongoClient(uri);

const dbName = 'Fichas';  
const collectionName = 'fichas';  

async function saveFicha(fichaData) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Guardar la ficha en la colección
        const result = await collection.insertOne(fichaData);
        return result;
    } catch (error) {
        console.error('Error al guardar la ficha:', error.message);  // Mostrar el mensaje del error
        console.error(error.stack);  // Mostrar el stack del error
        throw error;  // Volver a lanzar el error para manejarlo en otra parte si es necesario
    } finally {
        await client.close();
    }
}

async function getFichas() {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Obtener todas las fichas
        const fichas = await collection.find({}).toArray();
        return fichas;
    } catch (error) {
        console.error('Error al obtener las fichas:', error);
        throw error;
    } finally {
        await client.close();
    }
}

async function getFichaPorNombre(nombrePersonaje) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Buscar la ficha por el nombre del personaje
        console.log("Buscando en MongoDB por nombrePersonaje:", nombrePersonaje);
        const ficha = await collection.findOne({ "nombrePersonaje": nombrePersonaje });
        
        console.log("Resultado de la búsqueda:", ficha);
        return ficha;
    } catch (error) {
        console.error('Error al obtener la ficha por nombre:', error);
        throw error;
    } finally {
        await client.close();
    }
}



module.exports = { saveFicha, getFichas, getFichaPorNombre };*/