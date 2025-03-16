document.getElementById('crear-ficha-form').addEventListener('submit', async function(event) {
    event.preventDefault();

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

    if (!nombrePersonaje || !imagenPersonaje || !videoFondo || !historia || !personalidad) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    const miembrosArbol = Array.from(document.querySelectorAll('[name="miembro-arbol[]"]')).map(input => input.value);

    const habilidadInteligencia = document.getElementById('habilidad-inteligencia').value;
    const habilidadFormaFisica = document.getElementById('habilidad-forma-fisica').value;
    const habilidadZero = document.getElementById('habilidad-zero').value;
    const habilidadSigilo = document.getElementById('habilidad-sigilo').value;
    const habilidadReflejos = document.getElementById('habilidad-reflejos').value;
    const habilidadCombate = document.getElementById('habilidad-combate').value;

    // Crear un objeto para enviar al backend
    const fichaData = {
        nombrePersonaje,
        imagenPersonaje,
        videoFondo,
        carisma,
        economia,
        torpeza,
        belleza,
        social,
        historia,
        personalidad,
        habilidadesAdquiridas,
        miembrosArbol,
        habilidades: {
            inteligencia: habilidadInteligencia,
            formaFisica: habilidadFormaFisica,
            habilidadZero,
            sigilo: habilidadSigilo,
            reflejos: habilidadReflejos,
            combate: habilidadCombate
        }
    };

    // Enviar los datos al backend utilizando fetch
    try {
        const response = await fetch('/crear-ficha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fichaData),
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Ficha guardada correctamente');
            // Redirigir o realizar alguna otra acción
        } else {
            alert('Error al guardar la ficha: ' + result.message);
        }
    } catch (error) {
        alert('Error al enviar los datos al servidor: ' + error.message);
    }
});
