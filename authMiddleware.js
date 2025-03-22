function verificarAutenticacion(req, res, next) {
    const { username, isAdmin } = req.body;  // Obtener el username y el rol desde el cuerpo de la solicitud

    if (!username) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    // Si el rol es admin o el username corresponde al propietario de la ficha, continuar
    if (isAdmin || req.params.username === username) {
        return next();
    }

    return res.status(403).json({ success: false, message: 'No tienes permisos para acceder a esta ficha' });
}

module.exports = { verificarAutenticacion };