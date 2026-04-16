const { connectDB } = require('./db');

async function addArmadura() {
    try {
        const db = await connectDB();
        const collection = db.collection('fichas');

        const result = await collection.updateMany(
            { armadura: { $exists: false } }, // solo las que no lo tienen
            { $set: { armadura: "7" } }
        );

        console.log(`✅ Fichas actualizadas: ${result.modifiedCount}`);
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addArmadura();