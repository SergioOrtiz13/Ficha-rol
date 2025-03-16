function cargarFichasDinamicas() {
    fetch('/getFichas')  // Llamada al servidor para obtener las fichas desde la base de datos
        .then(response => response.json())
        .then(fichas => {
            const fichasGrid = document.querySelector('.fichas-grid');
            
            // Itera sobre las fichas obtenidas y agrega los enlaces dinámicamente
            fichas.forEach(ficha => {
                // Verifica si ya existe un enlace para la ficha
                if (!document.querySelector(`a[href="ficha-${ficha.nombrePersonaje}.html"]`)) {
                    // Crear el nuevo enlace para la ficha
                    const enlaceFicha = document.createElement('a');
                    enlaceFicha.href = `/ficha/${ficha.nombrePersonaje}`;  // Cambié esto para usar la URL correcta
                    enlaceFicha.textContent = `Ficha de ${ficha.nombrePersonaje}`;

                    // Añadir el enlace al contenedor de fichas
                    fichasGrid.appendChild(enlaceFicha);
                }
            });
        })
        .catch(error => console.error('Error al cargar las fichas dinámicas:', error));
}

// Llama a la función cuando se carga la página
window.onload = function() {
    cargarFichasDinamicas();
};



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

