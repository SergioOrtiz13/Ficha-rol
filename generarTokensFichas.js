// generarTokensFichas.js
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const MONGO_URI = 'mongodb+srv://root:root@cluster0.nz9sp.mongodb.net/';
const DB_NAME = 'Fichas';
const JWT_SECRET = 'Roleplay'; // mismo secreto que usas en tu server.js

async function generarTokens() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Conectado a MongoDB');

        const db = client.db(DB_NAME);
        const fichasCollection = db.collection('fichas');

        // Obtener todas las fichas
        const fichas = await fichasCollection.find({}).toArray();

        for (const ficha of fichas) {
            // Aquí decides qué incluir en el token, por ejemplo username del creador y nombrePersonaje
            const payload = {
                creadoPor: ficha.creadoPor,
                nombrePersonaje: ficha.nombrePersonaje
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '100y' });

            // Actualizar la ficha con el token
            await fichasCollection.updateOne(
                { _id: ficha._id },
                { $set: { token } }
            );

            console.log(`Token generado para ficha: ${ficha.nombrePersonaje}`);
        }

        console.log('Todos los tokens han sido generados y guardados.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

generarTokens();
