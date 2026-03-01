// Array para almacenar los turnos
let turnos = [];
let turnoActualIndex = -1;
let temporizadorMensaje = null;


// Función para cargar pantallas de archivos externos
async function cargarPantallas() {
    const container = document.querySelector('.container');
    
    const pantallas = [
        'pantalla-inicio.html',
        'pantalla-turno.html',
        'pantalla-mostrar.html',
        'pantalla-administrador.html'
    ];

    for (const archivo of pantallas) {
        try {
            const response = await fetch(archivo);
            const html = await response.text();
            container.innerHTML += html;
        } catch (error) {
            console.error(`Error al cargar ${archivo}:`, error);
        }
    }
}

// Cargar pantallas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarPantallas);

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
        actualizarDashboardAdmin();
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
    mostrarMensajeEmergente(codigoTurno);
}

// NUEVA FUNCIÓN para mostrar mensaje
function mostrarMensajeEmergente(turno) {
    // Limpiar temporizador anterior
    if (temporizadorMensaje) {
        clearTimeout(temporizadorMensaje);
    }

    const mensajeEmergente = document.getElementById('mensaje-emergente');
    const textoMensaje = document.getElementById('texto-mensaje');
    
    if (!mensajeEmergente || !textoMensaje) return;
    
    // Determinar icono según tipo
    const icono = turno.tipo === 'remesas' ? '📄' : '💰';
    
    // Mostrar el mensaje con el turno
    textoMensaje.innerHTML = `${icono} Su turno es: <span style="background: white; color: #5B2D8B; padding: 5px 15px; border-radius: 30px; margin-left: 10px;">${turno.codigo}</span>`;
    
    // Mostrar el mensaje
    mensajeEmergente.style.display = 'flex';
    
    // Ocultar después de 3 segundos (3000ms)
    temporizadorMensaje = setTimeout(() => {
        mensajeEmergente.style.display = 'none';
    }, 4000); // CAMBIA AQUÍ EL TIEMPO (2000 = 2s, 4000 = 4s, etc.)
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
        alert('❌ No hay turno en curso');
        return;
        actualizarDashboardAdmin();
    }

    turnoActualIndex++;
    actualizarVistas();
}

// funcion para actualizar el dashboard del administrador

let grafica = null;

function actualizarDashboardAdmin() {
    const remesas = turnos.filter(t => t.tipo === 'remesas').length;
    const pagos = turnos.filter(t => t.tipo !== 'remesas').length;

    document.getElementById('total-remesas').textContent = remesas;
    document.getElementById('total-pagos').textContent = pagos;

    // HISTORIAL
    const historial = document.getElementById('historial-dashboard');
    historial.innerHTML = '';

    if (turnos.length === 0) {
        historial.innerHTML = '<div class="vacio">No hay turnos registrados</div>';
    } else {
        turnos.forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'turno-item';
            div.textContent = `#${i + 1} - ${t.codigo} (${t.tipo})`;
            historial.appendChild(div);
        });
    }

    // GRÁFICA
    const ctx = document.getElementById('grafica-turnos');
    if (grafica) grafica.destroy();

    grafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Remesas', 'Pagos'],
            datasets: [{
                data: [remesas, pagos],
                backgroundColor: ['#5FAE4E', '#5B2D8B']
            }]
        }
    });
}