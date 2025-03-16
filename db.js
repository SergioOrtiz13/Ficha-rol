const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://root:root@cluster0.nz9sp.mongodb.net/';
const client = new MongoClient(uri);

async function authenticateUser(username, password) {
    try {
        await client.connect();
        const database = client.db('Fichas');
        const collection = database.collection('usuario');
        const user = await collection.findOne({ username: username });

        if (user && user.Password === password) {
            return true;
        } else {
            return false;
        }
    } finally {
        await client.close();
    }
}

module.exports = { authenticateUser };