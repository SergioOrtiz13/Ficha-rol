function actualizarHabilidades() {
    var habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value;
    localStorage.setItem('habilidadesAdquiridasLeon', habilidadesAdquiridas);
}

function cargarHabilidades() {
    var habilidadesAdquiridas = localStorage.getItem('habilidadesAdquiridasLeon');
    if (habilidadesAdquiridas) {
        document.getElementById('habilidades-adquiridas').value = habilidadesAdquiridas;
    }
}

function sumar(caracteristica) {
    var elemento = document.getElementById(caracteristica);
    var valor = parseInt(elemento.textContent);
    elemento.textContent = valor + 1;
    localStorage.setItem(caracteristica + 'Leon', valor + 1);
}

function restar(caracteristica) {
    var elemento = document.getElementById(caracteristica);
    var valor = parseInt(elemento.textContent);
    if (valor > 0) {
        elemento.textContent = valor - 1;
        localStorage.setItem(caracteristica + 'Leon', valor - 1);
    }
}

function cargarCaracteristicas() {
    var caracteristicas = ['carisma', 'economia', 'torpeza', 'belleza', 'social', 'habilidad-inteligencia', 'habilidad-forma-fisica', 'habilidad-zero', 'habilidad-sigilo', 'habilidad-reflejos', 'habilidad-combate'];
    caracteristicas.forEach(function(caracteristica) {
        var valor = localStorage.getItem(caracteristica + 'Leon');
        if (valor) {
            document.getElementById(caracteristica).textContent = valor;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCaracteristicas();
    cargarHabilidades();
    document.getElementById('habilidades-adquiridas').addEventListener('input', actualizarHabilidades);
});