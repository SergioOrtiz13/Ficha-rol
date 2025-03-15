document.getElementById('crear-ficha-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const nombrePersonaje = document.getElementById('nombre-personaje').value;
    const imagenPersonaje = document.getElementById('imagen-personaje').files[0];
    const videoFondo = document.getElementById('video-fondo').files[0];
    const carisma = document.getElementById('carisma').value;
    const economia = document.getElementById('economia').value;
    const torpeza = document.getElementById('torpeza').value;
    const belleza = document.getElementById('belleza').value;
    const social = document.getElementById('social').value;
    const historia = document.getElementById('historia').value;
    const personalidad = document.getElementById('personalidad').value;
    const habilidadesAdquiridas = document.getElementById('habilidades-adquiridas').value;

    // Validación de campos obligatorios
    if (!nombrePersonaje || !imagenPersonaje || !videoFondo || !historia || !personalidad) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    // Obtener los miembros del árbol genealógico
    const miembrosArbol = Array.from(document.querySelectorAll('[name="miembro-arbol[]"]')).map(input => input.value);

    // Obtener las habilidades desde el formulario
    const habilidadInteligencia = document.getElementById('habilidad-inteligencia').value;
    const habilidadFormaFisica = document.getElementById('habilidad-forma-fisica').value;
    const habilidadZero = document.getElementById('habilidad-zero').value;
    const habilidadSigilo = document.getElementById('habilidad-sigilo').value;
    const habilidadReflejos = document.getElementById('habilidad-reflejos').value;
    const habilidadCombate = document.getElementById('habilidad-combate').value;

    // Crear los FileReaders para leer los archivos
    const readerImagen = new FileReader();
    const readerVideo = new FileReader();

    // Procesar los archivos de imagen y video
    Promise.all([
        new Promise((resolve, reject) => {
            readerImagen.onload = function(e) {
                resolve(e.target.result);
            };
            readerImagen.onerror = reject;
            readerImagen.readAsDataURL(imagenPersonaje);
        }),
        new Promise((resolve, reject) => {
            readerVideo.onload = function(e) {
                resolve(e.target.result);
            };
            readerVideo.onerror = reject;
            readerVideo.readAsDataURL(videoFondo);
        })
    ]).then(([imagenData, videoData]) => {
        // Generar el contenido de la ficha HTML con el estilo incluido
        const contenidoFicha = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ficha de ${nombrePersonaje}</title>
    <link rel="stylesheet" href="ficha.css">
    <style>
        body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #0d0d0d;
    color: #e0e0e0;
    margin: 0;
    padding: 20px;

}
.video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1; /* Coloca el video detrás del contenido */
    object-fit: cover; /* Asegura que el video cubra toda la pantalla */
}
.ficha {
    background-color: rgba(0, 0, 0, 0.7);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
    max-width: 800px;
    margin: auto;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header h1 {
    flex: 1;
    color: #ffffff;
}
.header img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 3px solid #00ffdd;
    margin-left: 20px;
}
.caracteristicas {
    margin-top: 20px;
}
.caracteristica {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.caracteristica label {
    flex: 1;
}
.caracteristica button {
    margin-left: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #00ffdd;
    color: #0d0d0d;
    border-radius: 4px;
    cursor: pointer;
}
.caracteristica button:hover {
    background-color: #0045e6;
}
.historia, .personalidad, .habilidades {
    margin-top: 20px;
}
.habilidades p {
    margin: 5px 0;
}
#habilidades-adquiridas {
    width: 95%;
    padding: 10px;
    border: 1px solid #00ffdd;
    border-radius: 4px;
    background-color: #333;
    color: #e0e0e0;
}
.arbol-genealogico {
    margin-top: 20px;
}
.arbol-genealogico ul {
    list-style-type: none;
    padding: 0;
}
.arbol-genealogico li {
    margin: 5px 0;
    padding: 5px;
    background-color: #333;
    border-radius: 4px;
}
    .dados {
            display: flex;
            justify-content: center;
            margin-top: 10px;
        }
        .dado {
            width: 50px;
            height: 50px;
            margin: 0 5px;
            background: url('img/dado.png') no-repeat center center;
            background-size: cover;
            animation: girar 1s infinite;
        }
        @keyframes girar {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <video class="video-background" autoplay muted loop>
        <source src="${videoData}" type="video/mp4">
        Tu navegador no soporta el elemento de video.
    </video>
    <div class="ficha">
        <div class="header">
            <h1>Nombre del Personaje: ${nombrePersonaje}</h1>
            <img src="${imagenData}" alt="Imagen de ${nombrePersonaje}" class="imagen-circular">
        </div>

        <button onclick="tirarDados()">Tirar Dados</button>
            <div id="resultado-dados"></div>

        <div class="caracteristicas">
            <h2>Características de Conquista</h2>
            <div class="caracteristica">
                <label>Carisma: <span id="carisma-value">${carisma}</span></label>
                <button type="button" onclick="modificarValor('carisma', -1)">-</button>
                <button type="button" onclick="modificarValor('carisma', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Economía: <span id="economia-value">${economia}</span></label>
                <button type="button" onclick="modificarValor('economia', -1)">-</button>
                <button type="button" onclick="modificarValor('economia', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Torpeza: <span id="torpeza-value">${torpeza}</span></label>
                <button type="button" onclick="modificarValor('torpeza', -1)">-</button>
                <button type="button" onclick="modificarValor('torpeza', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Belleza: <span id="belleza-value">${belleza}</span></label>
                <button type="button" onclick="modificarValor('belleza', -1)">-</button>
                <button type="button" onclick="modificarValor('belleza', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Social: <span id="social-value">${social}</span></label>
                <button type="button" onclick="modificarValor('social', -1)">-</button>
                <button type="button" onclick="modificarValor('social', 1)">+</button>
            </div>
        </div>

        <!-- Se repite para las habilidades -->
        <div class="habilidades">
            <h2>Habilidades</h2>
            <div class="caracteristica">
                <label>Inteligencia: <span id="habilidad-inteligencia-value">${habilidadInteligencia}</span></label>
                <button type="button" onclick="modificarValor('habilidad-inteligencia', -1)">-</button>
                <button type="button" onclick="modificarValor('habilidad-inteligencia', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Forma Física: <span id="habilidad-forma-fisica-value">${habilidadFormaFisica}</span></label>
                <button type="button" onclick="modificarValor('habilidad-forma-fisica', -1)">-</button>
                <button type="button" onclick="modificarValor('habilidad-forma-fisica', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Habilidad Zero: <span id="habilidad-zero-value">${habilidadZero}</span></label>
                <button type="button" onclick="modificarValor('habilidad-zero', -1)">-</button>
                <button type="button" onclick="modificarValor('habilidad-zero', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Sigilo: <span id="habilidad-sigilo-value">${habilidadSigilo}</span></label>
                <button type="button" onclick="modificarValor('habilidad-sigilo', -1)">-</button>
                <button type="button" onclick="modificarValor('habilidad-sigilo', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Reflejos: <span id="habilidad-reflejos-value">${habilidadReflejos}</span></label>
                <button type="button" onclick="modificarValor('habilidad-reflejos', -1)">-</button>
                <button type="button" onclick="modificarValor('habilidad-reflejos', 1)">+</button>
            </div>
            <div class="caracteristica">
                <label>Combate: <span id="habilidad-combate-value">${habilidadCombate}</span></label>
                <button type="button" onclick="modificarValor('habilidad-combate', -1)">-</button>
                <button type="button" onclick="modificarValor('habilidad-combate', 1)">+</button>
            </div>
        </div>

        <div class="historia">
            <h2>Historia</h2>
            <p>${historia}</p>
        </div>

        <div class="personalidad">
            <h2>Personalidad</h2>
            <p>${personalidad}</p>
        </div>

        <div class="habilidades-textarea">
            <h2>Habilidades Adquiridas</h2>
            <textarea id="habilidades-adquiridas" rows="4" placeholder="Se irán viendo durante la partida">${habilidadesAdquiridas}</textarea>
        </div>

        <div class="arbol-genealogico">
            <h2>Árbol Genealógico</h2>
            <ul>
                ${miembrosArbol.map(miembro => `<li>${miembro}</li>`).join('')}
            </ul>
        </div>
    </div>
    <script>
        function modificarValor(id, operacion) {
            let valorElement = document.getElementById(id + '-value');
            let valor = parseInt(valorElement.textContent);
            valor += operacion;
            valorElement.textContent = valor;
        }
    </script>
    <script src="tiradas.js"></script>
</body>
</html>
`;

        // Descargar la ficha como un archivo HTML
        const blob = new Blob([contenidoFicha], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${nombrePersonaje}-ficha.html`;
        link.click();

        // Generar el archivo JS para la funcionalidad específica de esta ficha
        const contenidoJS = `
document.addEventListener('DOMContentLoaded', function() {
    const habilidadInteligencia = document.getElementById('habilidad-inteligencia-value');
    const habilidadFormaFisica = document.getElementById('habilidad-forma-fisica-value');
    const habilidadZero = document.getElementById('habilidad-zero-value');
    const habilidadSigilo = document.getElementById('habilidad-sigilo-value');
    const habilidadReflejos = document.getElementById('habilidad-reflejos-value');
    const habilidadCombate = document.getElementById('habilidad-combate-value');

    window.modificarValor = function(id, operacion) {
        const valorElement = document.getElementById(id + '-value');
        let valor = parseInt(valorElement.textContent);
        valor += operacion;
        valorElement.textContent = valor;
    };
});
`;

        // Descargar el archivo JS como un archivo
        const blobJS = new Blob([contenidoJS], { type: 'application/javascript' });
        const linkJS = document.createElement('a');
        linkJS.href = URL.createObjectURL(blobJS);
        linkJS.download = `${nombrePersonaje}-ficha.js`;
        linkJS.click();

    }).catch(error => {
        alert('Ocurrió un error al procesar los archivos: ' + error.message);
    });
});

function agregarMiembro() {
    const container = document.getElementById('arbol-genealogico-container');
    const newItem = document.createElement('div');
    newItem.classList.add('arbol-genealogico-item');
    newItem.innerHTML = `
        <input type="text" name="miembro-arbol[]" placeholder="Miembro del árbol genealógico" required>
        <button type="button" class="eliminar-arbol" onclick="eliminarMiembro(this)">Eliminar</button>
    `;
    container.appendChild(newItem);
}

function eliminarMiembro(button) {
    button.parentElement.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    // Obtener el nombre del personaje (pasado desde el HTML al crear el archivo)
    const nombrePersonaje = 'nombreDelPersonaje'; // Deberías reemplazar esto dinámicamente con el nombre del personaje

    // Cargar las características y habilidades desde el almacenamiento local
    cargarCaracteristicas();
    cargarHabilidades();

    // Función para cargar las características
    function cargarCaracteristicas() {
        const carisma = localStorage.getItem(`${nombrePersonaje}-Carisma`) || 0;
        const economia = localStorage.getItem(`${nombrePersonaje}-Economia`) || 0;
        const torpeza = localStorage.getItem(`${nombrePersonaje}-Torpeza`) || 0;
        const belleza = localStorage.getItem(`${nombrePersonaje}-Belleza`) || 0;
        const social = localStorage.getItem(`${nombrePersonaje}-Social`) || 0;

        document.getElementById('carisma-value').textContent = carisma;
        document.getElementById('economia-value').textContent = economia;
        document.getElementById('torpeza-value').textContent = torpeza;
        document.getElementById('belleza-value').textContent = belleza;
        document.getElementById('social-value').textContent = social;
    }

    // Función para cargar las habilidades
    function cargarHabilidades() {
        const habilidadInteligencia = localStorage.getItem(`${nombrePersonaje}-habilidad-inteligencia`) || 0;
        const habilidadFormaFisica = localStorage.getItem(`${nombrePersonaje}-habilidad-forma-fisica`) || 0;
        const habilidadZero = localStorage.getItem(`${nombrePersonaje}-habilidad-zero`) || 0;
        const habilidadSigilo = localStorage.getItem(`${nombrePersonaje}-habilidad-sigilo`) || 0;
        const habilidadReflejos = localStorage.getItem(`${nombrePersonaje}-habilidad-reflejos`) || 0;
        const habilidadCombate = localStorage.getItem(`${nombrePersonaje}-habilidad-combate`) || 0;

        document.getElementById('habilidad-inteligencia-value').textContent = habilidadInteligencia;
        document.getElementById('habilidad-forma-fisica-value').textContent = habilidadFormaFisica;
        document.getElementById('habilidad-zero-value').textContent = habilidadZero;
        document.getElementById('habilidad-sigilo-value').textContent = habilidadSigilo;
        document.getElementById('habilidad-reflejos-value').textContent = habilidadReflejos;
        document.getElementById('habilidad-combate-value').textContent = habilidadCombate;
    }

    // Función para actualizar las habilidades en el almacenamiento local
    function actualizarHabilidades() {
        const habilidadInteligencia = document.getElementById('habilidad-inteligencia-value').textContent;
        const habilidadFormaFisica = document.getElementById('habilidad-forma-fisica-value').textContent;
        const habilidadZero = document.getElementById('habilidad-zero-value').textContent;
        const habilidadSigilo = document.getElementById('habilidad-sigilo-value').textContent;
        const habilidadReflejos = document.getElementById('habilidad-reflejos-value').textContent;
        const habilidadCombate = document.getElementById('habilidad-combate-value').textContent;

        // Guardar las habilidades en el almacenamiento local con el nombre del personaje
        localStorage.setItem(`${nombrePersonaje}-habilidad-inteligencia`, habilidadInteligencia);
        localStorage.setItem(`${nombrePersonaje}-habilidad-forma-fisica`, habilidadFormaFisica);
        localStorage.setItem(`${nombrePersonaje}-habilidad-zero`, habilidadZero);
        localStorage.setItem(`${nombrePersonaje}-habilidad-sigilo`, habilidadSigilo);
        localStorage.setItem(`${nombrePersonaje}-habilidad-reflejos`, habilidadReflejos);
        localStorage.setItem(`${nombrePersonaje}-habilidad-combate`, habilidadCombate);
    }

    // Función para sumar o restar una característica
    function sumar(caracteristica) {
        let valorElement = document.getElementById(`${caracteristica}-value`);
        let valor = parseInt(valorElement.textContent);
        valor++;
        valorElement.textContent = valor;
        localStorage.setItem(`${nombrePersonaje}-${caracteristica}`, valor);
    }

    function restar(caracteristica) {
        let valorElement = document.getElementById(`${caracteristica}-value`);
        let valor = parseInt(valorElement.textContent);
        valor--;
        valorElement.textContent = valor;
        localStorage.setItem(`${nombrePersonaje}-${caracteristica}`, valor);
    }

    // Event listeners para los botones de sumar y restar
    document.querySelectorAll('.caracteristica button').forEach(button => {
        button.addEventListener('click', function() {
            const caracteristica = this.closest('.caracteristica').querySelector('label').textContent.trim().toLowerCase();
            if (this.textContent === '+') {
                sumar(caracteristica);
            } else {
                restar(caracteristica);
            }
        });
    });

    // Actualizar las habilidades al final
    actualizarHabilidades();
});
