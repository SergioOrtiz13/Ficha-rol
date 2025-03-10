function mostrarFicha(personaje) {
    fetch('ficha.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const ficha = doc.getElementById(`ficha-${personaje}`);
            document.getElementById('ficha-container').innerHTML = ficha.outerHTML;
            inicializarFicha();
        })
        .catch(error => console.error('Error al cargar la ficha:', error));
}

function inicializarFicha() {
    // Cargar el script de ficha.js
    var script = document.createElement('script');
    script.src = 'ficha.js';
    document.body.appendChild(script);
}

