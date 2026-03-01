const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configurar CORS
app.use(cors());
app.use(express.json());

// Configurar la conexión a PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Probar la conexión a la BD
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos:', res.rows[0]);
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'Backend TurnoSelector funcionando' });
});

// Ruta para registrar un turno
app.post('/api/turnos', async (req, res) => {
    try {
        const { numTurno, tipo } = req.body;

        // Validar que el tipo sea válido (remesas o pago)
        if (tipo !== 'remesas' && tipo !== 'pago') {
            return res.status(400).json({ error: 'Tipo de turno inválido' });
        }

        // Mapear tipo a idServicio (1 = remesas, 2 = pago)
        const idServicio = tipo === 'remesas' ? 1 : 2;

        // Insertar en la BD
        const query = 'INSERT INTO turnos (numturno, idservicio, idestado, fechacreacion) VALUES ($1, $2, 1, NOW()) RETURNING *';
        const result = await pool.query(query, [numTurno, idServicio]);

        res.status(201).json({
            mensaje: 'Turno registrado exitosamente',
            turno: result.rows[0]
        });
    } catch (error) {
        console.error('Error al registrar turno:', error);
        res.status(500).json({ error: 'Error al registrar turno' });
    }
});

// Ruta para obtener todos los turnos
app.get('/api/turnos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM turnos ORDER BY fechacreacion DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener turnos:', error);
        res.status(500).json({ error: 'Error al obtener turnos' });
    }
});

// Ruta para obtener turnos por tipo
app.get('/api/turnos/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;

        if (tipo !== 'remesas' && tipo !== 'pago') {
            return res.status(400).json({ error: 'Tipo de turno inválido' });
        }

        const idServicio = tipo === 'remesas' ? 1 : 2;
        const query = 'SELECT * FROM turnos WHERE idservicio = $1 ORDER BY fechacreacion DESC';
        const result = await pool.query(query, [idServicio]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener turnos:', error);
        res.status(500).json({ error: 'Error al obtener turnos' });
    }
});

// Ruta para obtener un turno específico
app.get('/api/turnos/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM turnos WHERE idturno = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener turno:', error);
        res.status(500).json({ error: 'Error al obtener turno' });
    }
});

// Ruta para actualizar el estado de un turno y la fecha de atención
app.put('/api/turnos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { idEstado } = req.body;

        let query, params;
        
        // Si se está marcando como atendido (idEstado = 2), registrar la fecha de atención
        if (idEstado === 2) {
            query = 'UPDATE turnos SET idestado = $1, fechatencion = NOW() WHERE idturno = $2 RETURNING *';
            params = [idEstado, id];
        } else {
            query = 'UPDATE turnos SET idestado = $1 WHERE idturno = $2 RETURNING *';
            params = [idEstado, id];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        res.json({
            mensaje: 'Turno actualizado exitosamente',
            turno: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar turno:', error);
        res.status(500).json({ error: 'Error al actualizar turno' });
    }
});

// Ruta para eliminar un turno
app.delete('/api/turnos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM turnos WHERE idturno = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        res.json({ mensaje: 'Turno eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar turno:', error);
        res.status(500).json({ error: 'Error al eliminar turno' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend ejecutándose en http://localhost:${port}`);
});
