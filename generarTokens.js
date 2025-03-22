const jwt = require('jsonwebtoken');
const { connectDB } = require('./db'); // Tu función para conectar a la base de datos
const JWT_SECRET = 'RolePlay';  // Asegúrate de usar un secreto fuerte y guardarlo de forma segura

async function generarTokens() {
    const database = await connectDB();
    const collection = database.collection('usuario');  // Suponiendo que la colección se llama 'usuario'
    
    // Buscar todos los usuarios que no tienen un token
    const usuarios = await collection.find({ token: { $exists: false } }).toArray();  // Solo los que no tienen token

    if (usuarios.length === 0) {
        console.log('No hay usuarios sin token.');
        return;
    }

    for (const usuario of usuarios) {
        const token = jwt.sign({ username: usuario.username }, JWT_SECRET, { expiresIn: '1h' });  // Firmar el token

        try {
            // Actualizar el usuario con el token generado
            await collection.updateOne(
                { _id: usuario._id },
                { $set: { token: token } }
            );

            console.log(`Token generado para el usuario: ${usuario.username}`);
        } catch (err) {
            console.error(`Error al generar el token para ${usuario.username}:`, err);
        }
    }

    console.log('Proceso de generación de tokens finalizado.');
}

generarTokens();