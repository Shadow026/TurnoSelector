// Array para almacenar los turnos
let turnos = [];
let turnoActualIndex = -1;



// Función para cambiar de pantalla
function irA(pantalla) {
    // Ocultar todas las pantallas
    const pantallas = document.querySelectorAll('.pantalla');
    pantallas.forEach(p => p.classList.remove('activa'));

    // Mostrar la pantalla seleccionada
    const pantallaNueva = document.getElementById('pantalla-' + pantalla);
    if (pantallaNueva) {
        pantallaNueva.classList.add('activa');
    }

    // Actualizar vistas cuando se llega a mostrar o administrador
    if (pantalla === 'mostrar' || pantalla === 'administrador') {
        actualizarVistas();
    }
}

// Función para generar un código de turno
function generarCodigo(tipo) {
    // Número aleatorio entre 1 y 999
    const numero = Math.floor(Math.random() * 999) + 1;

    // Letra aleatoria (A-Z)
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letra = letras[Math.floor(Math.random() * letras.length)];

    return {
        numero: numero,
        letra: letra,
        tipo: tipo,
        codigo: numero + letra
    };
}

// Función para generar un turno
function generarTurno(tipo) {
    const codigoTurno = generarCodigo(tipo);
    turnos.push(codigoTurno);

    // Si es el primer turno, establecerlo como actual
    if (turnoActualIndex === -1) {
        turnoActualIndex = 0;
    }

    actualizarListaTurnos();
    //ALERT - Esto funciona en TODOS los navegadores
    if (tipo === 'remesas') {
        alert('TURNO GENERADO - Remesas: ' + codigoTurno.codigo);
    } else {
        alert('TURNO GENERADO - Pago de Recibos: ' + codigoTurno.codigo);
    }
}

// Función para actualizar la lista de turnos en la pantalla de turno
function actualizarListaTurnos() {
    const listaTurnos = document.getElementById('lista-turnos');
    listaTurnos.innerHTML = '';

    if (turnos.length === 0) {
        listaTurnos.innerHTML = '<div class="vacio">No hay turnos generados</div>';
        return;
    }

    turnos.forEach((turno, index) => {
        const div = document.createElement('div');
        div.className = 'turno-item';
        const tipoCod = turno.tipo === 'remesas' ? 'Remesas' : 'Pago de Recibos';
        div.textContent = `Turno ${index + 1}: ${turno.codigo} (${tipoCod})`;
        listaTurnos.appendChild(div);
    });
}

// Función para actualizar las vistas de mostrar y administrador
function actualizarVistas() {
    const turnoActualMostrar = document.getElementById('turno-actual-mostrar');
    const turnoActualAdmin = document.getElementById('turno-actual-admin');
    const proximosTurnos = document.getElementById('proximos-turnos');

    if (turnoActualIndex === -1 || turnoActualIndex >= turnos.length) {
        turnoActualMostrar.textContent = 'Ninguno';
        turnoActualAdmin.textContent = 'Ninguno';
        proximosTurnos.innerHTML = '<div class="vacio">No hay turnos en la fila</div>';
        return;
    }

    const turnoActual = turnos[turnoActualIndex];
    const tipoTurno = turnoActual.tipo === 'remesas' ? 'Remesas' : 'Pago de Recibos';
    const textoTurno = `${turnoActual.codigo} (${tipoTurno})`;

    turnoActualMostrar.textContent = textoTurno;
    turnoActualAdmin.textContent = textoTurno;

    // Mostrar próximos turnos
    proximosTurnos.innerHTML = '';
    if (turnoActualIndex + 1 < turnos.length) {
        for (let i = turnoActualIndex + 1; i < turnos.length; i++) {
            const turno = turnos[i];
            const tipo = turno.tipo === 'remesas' ? 'Remesas' : 'Pago de Recibos';
            const div = document.createElement('div');
            div.className = 'turno-item';
            div.textContent = `Turno ${i + 1}: ${turno.codigo} (${tipo})`;
            proximosTurnos.appendChild(div);
        }
    } else {
        proximosTurnos.innerHTML = '<div class="vacio">No hay más turnos</div>';
    }
}

// Función para terminar el turno actual
function terminarTurno() {
    if (turnoActualIndex === -1 || turnoActualIndex >= turnos.length) {
        alert('No hay turno en cursos');
        return;
    }

    turnoActualIndex++;
    actualizarVistas();
}