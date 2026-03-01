// Configuración de conexión al backend
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Registra un turno en la base de datos
 * @param {string} numTurno - Número del turno (ej: "123A")
 * @param {string} tipo - Tipo de turno ('remesas' o 'pago')
 * @returns {object} Objeto con datos del turno registrado incluyendo idTurno
 */
async function registrarTurnoEnBD(numTurno, tipo) {
    try {
        console.log('Enviando turno a BD:', { numTurno, tipo });
        
        const response = await fetch(`${API_BASE_URL}/turnos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                numTurno: numTurno,
                tipo: tipo
            })
        });

        if (!response.ok) {
            console.error(`Error HTTP ${response.status} al enviar turno`);
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Turno registrado exitosamente en BD:', data);
        return data.turno;
    } catch (error) {
        console.error('Error al registrar turno en BD:', error.message);
        return null;
    }
}

/**
 * Obtiene todos los turnos de la base de datos
 */
async function obtenerTodosLosTurnos() {
    try {
        console.log('Solicitando todos los turnos...');
        
        const response = await fetch(`${API_BASE_URL}/turnos`);
        if (!response.ok) {
            console.error(`Error HTTP ${response.status} al obtener turnos`);
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Turnos obtenidos exitosamente: ${data.length} turnos`, data);
        return data;
    } catch (error) {
        console.error('Error al obtener turnos:', error.message);
        return [];
    }
}

/**
 * Obtiene turnos por tipo
 * @param {string} tipo - 'remesas' o 'pago'
 */
async function obtenerTurnosPorTipo(tipo) {
    try {
        console.log(`Solicitando turnos de tipo: ${tipo}`);
        
        const response = await fetch(`${API_BASE_URL}/turnos/${tipo}`);
        if (!response.ok) {
            console.error(`Error HTTP ${response.status} al obtener turnos de tipo ${tipo}`);
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Turnos de tipo '${tipo}' obtenidos: ${data.length} turnos`, data);
        return data;
    } catch (error) {
        console.error(`Error al obtener turnos de tipo ${tipo}:`, error.message);
        return [];
    }
}

/**
 * Actualiza el estado de un turno
 * @param {number} id - ID del turno (idTurno)
 * @param {number} idEstado - Nuevo estado del turno (1=Esperando, 2=Atendido, 3=Cancelado)
 */
async function actualizarEstadoTurno(id, idEstado) {
    try {
        console.log(`Actualizando turno ID ${id} a estado ${idEstado}...`);
        
        const response = await fetch(`${API_BASE_URL}/turnos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idEstado: idEstado
            })
        });

        if (!response.ok) {
            console.error(`Error HTTP ${response.status} al actualizar turno`);
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Turno ID ${id} actualizado exitosamente a estado ${idEstado}:`, data);
        return data.turno;
    } catch (error) {
        console.error(`Error al actualizar turno ${id}:`, error.message);
        return null;
    }
}
