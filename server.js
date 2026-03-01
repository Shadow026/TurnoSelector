// Para la configuracion del servidor

// No sera el gran archivo solo para iniciarlo o la conexion junta de todas las rutas

// Pruebas de express iniciar servidor

import express from "express";


// Creacion de objeto para servidor
const app = express();

// desabilitar X-Powered-By por seguridad (aparece al enviar datos asi que mejor desabilitar)
app.disable('x-powered-by')


// GET inicio
app.get('/', (req, res) => {
  res.send('Prueba de Node js')
})

// Puerto de servidor
const server = app.listen(0, ()=>{
   const port = server.address().port;
  console.log(`Server is runing on port ${port}`)
})
