// Array para almacenar los turnos
let turnos = [];
let turnoActualIndex = -1;
let temporizadorMensaje = null;
let intervalActualizacion = null; // Para actualización en tiempo real


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
async function irA(pantalla) {
    // Ocultar todas las pantallas
    const pantallas = document.querySelectorAll('.pantalla');
    pantallas.forEach(p => p.classList.remove('activa'));

    // Mostrar la pantalla seleccionada
    const pantallaNueva = document.getElementById('pantalla-' + pantalla);
    if (pantallaNueva) {
        pantallaNueva.classList.add('activa');
    }

    // Detener intervalo anterior
    if (intervalActualizacion) {
        clearInterval(intervalActualizacion);
        intervalActualizacion = null;
    }

    // Actualizar vistas cuando se llega a mostrar o administrador
    if (pantalla === 'mostrar' || pantalla === 'administrador') {
        await actualizarVistas();
        
        // Iniciar actualización automática cada 2 segundos (solo para turnos, no para gráfico)
        console.log('Iniciando actualización automática en tiempo real...');
        intervalActualizacion = setInterval(async () => {
            await actualizarVistas();
        }, 2000); // Actualizar cada 2 segundos
    }
}

// Función para generar un código de turno
function generarCodigo(tipo) {
    // Número aleatorio entre 0 y 999 con padding a 3 dígitos
    const numero = Math.floor(Math.random() * 1000);
    const numeroFormateado = String(numero).padStart(3, '0');

    // Código con formato: TK + número (ej: TK333)
    const codigo = 'TK' + numeroFormateado;

    return {
        numero: numero,
        tipo: tipo,
        codigo: codigo
    };
}

// Función para generar un turno
async function generarTurno(tipo) {
    const codigoTurno = generarCodigo(tipo);
    
    // Registrar en la BD inmediatamente
    const turnoRegistrado = await registrarTurnoEnBD(codigoTurno.codigo, tipo);
    
    if (turnoRegistrado) {
        // Agregar el ID de la BD al objeto turno
        codigoTurno.idTurno = turnoRegistrado.idTurno || turnoRegistrado.id;
    }
    
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

// Función para actualizar las vistas de mostrar y administrador (desde BD)
async function actualizarVistas() {
    const turnoActualMostrar = document.getElementById('turno-actual-mostrar');
    const turnoActualAdmin = document.getElementById('turno-actual-admin');

    // Validar que los elementos existan
    if (!turnoActualMostrar && !turnoActualAdmin) {
        return;
    }

    try {
        // Obtener turnos de la BD
        console.log('Obteniendo turnos de la BD para mostrar...');
        const turnosBD = await obtenerTodosLosTurnos();

        // Filtrar turnos esperando (idestado = 1) y ordenar por fecha
        const turnosEsperando = turnosBD.filter(t => t.idestado === 1).sort((a, b) => 
            new Date(a.fechacreacion) - new Date(b.fechacreacion)
        );

        if (turnosEsperando.length === 0) {
            console.log('No hay turnos esperando');
            if (turnoActualMostrar) turnoActualMostrar.textContent = 'Ninguno';
            if (turnoActualAdmin) turnoActualAdmin.textContent = 'Ninguno';
            return;
        }

        // Mostrar el primer turno (el más antiguo)
        const primerTurno = turnosEsperando[0];
        const textoTurno = primerTurno.numturno;

        console.log(`Mostrando turno: ${textoTurno}`);
        
        if (turnoActualMostrar) turnoActualMostrar.textContent = textoTurno;
        if (turnoActualAdmin) turnoActualAdmin.textContent = textoTurno;

    } catch (error) {
        console.error('Error al actualizar vistas:', error);
        if (turnoActualMostrar) turnoActualMostrar.textContent = 'Error';
        if (turnoActualAdmin) turnoActualAdmin.textContent = 'Error';
    }
}

// Función para terminar el turno actual
async function terminarTurno() {
    try {
        console.log('Iniciando proceso de terminar turno...');
        
        // Obtener todos los turnos de la BD
        const turnosBD = await obtenerTodosLosTurnos();
        
        // Filtrar turnos esperando (idestado = 1)
        const turnosEsperando = turnosBD.filter(t => t.idestado === 1).sort((a, b) => 
            new Date(a.fechacreacion) - new Date(b.fechacreacion)
        );
        
        if (turnosEsperando.length === 0) {
            console.warn('No hay turnos en estado Esperando para terminar');
            alert('❌ No hay turnos esperando');
            return;
        }
        
        // Obtener el primer turno esperando (el que se muestra actualmente)
        const turnoActualBD = turnosEsperando[0];
        console.log(`Turno a terminar: ${turnoActualBD.numturno} (ID: ${turnoActualBD.idturno}`);
        
        // Cambiar su estado a 2 (Atendido)
        await actualizarEstadoTurno(turnoActualBD.idturno, 2);
        console.log(`Turno ${turnoActualBD.numturno} marcado como ATENDIDO (Estado 2)`);
        
        // Recargar vistas desde BD - ahora mostrará el siguiente turno
        await actualizarDashboardAdmin();
        await actualizarVistas();
        console.log(`Vistas actualizadas - Próximo turno mostrado`);
        
    } catch (error) {
        console.error('Error al terminar turno:', error);
        alert('Error al terminar turno');
    }
}

// funcion para actualizar el dashboard del administrador

let grafica = null;

async function actualizarDashboardAdmin() {
    const remesasElement = document.getElementById('total-remesas');
    const pagosElement = document.getElementById('total-pagos');
    const historialElement = document.getElementById('historial-dashboard');
    const ctxElement = document.getElementById('grafica-turnos');

    // Si no existen los elementos, no hacer nada
    if (!remesasElement || !pagosElement || !historialElement || !ctxElement) {
        return;
    }

    try {
        // Obtener turnos de la BD
        console.log('Obteniendo estadísticas de BD...');
        const turnosBD = await obtenerTodosLosTurnos();

        // Contar por tipo de servicio
        const remesas = turnosBD.filter(t => t.idservicio === 1).length;
        const pagos = turnosBD.filter(t => t.idservicio === 2).length;

        remesasElement.textContent = remesas;
        pagosElement.textContent = pagos;

        console.log(`Estadísticas actualizadas: ${remesas} remesas, ${pagos} pagos`);

        // HISTORIAL
        historialElement.innerHTML = '';

        if (turnosBD.length === 0) {
            historialElement.innerHTML = '<div class="vacio">No hay turnos registrados</div>';
        } else {
            turnosBD.slice().reverse().forEach((t, i) => {
                const div = document.createElement('div');
                div.className = 'turno-item';
                const estado = t.idestado === 1 ? '⏳ Esperando' : (t.idestado === 2 ? '✅ Atendido' : '❌ Cancelado');
                div.textContent = `${t.numturno} - ${estado}`;
                historialElement.appendChild(div);
            });
        }

        // GRÁFICA
        if (grafica) grafica.destroy();

        grafica = new Chart(ctxElement, {
            type: 'doughnut',
            data: {
                labels: ['Remesas', 'Pagos'],
                datasets: [{
                    data: [remesas, pagos],
                    backgroundColor: ['#5FAE4E', '#5B2D8B']
                }]
            }
        });
    } catch (error) {
        console.error('Error al actualizar dashboard:', error);
    }
}