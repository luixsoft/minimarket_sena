const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const productoRoutes = require('./routes/producto Routes');
const empleadoRoutes = require('./routes/empleado Routes');
const ventaRoutes = require('./routes/ventaRoutes');


var app = express();
app.use(express.json());

//Asignamos puerto 4000 a una variable
var puerto = 4000

// Arranque del servidor
app.listen(puerto, function () {
    console.log('conexion con servidor ok en puerto 4000')
})

// crear la primera ruta de acceso con el metodo get
app.get('/app', function (req, res) {
    res.send('primera ruta de inicio')
})

//se definen parametros de conexion con la BD
var conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'minimarket_sena'
});

//probamos la conexion
conexion.connect(function (error) {
    if (error) {
        throw error;

    } else {
        console.log('conexion exitosa con BD')
    }
});

// conexion de rutas//
app.use('/app', productoRoutes(conexion));
app.use('/app', empleadoRoutes(conexion));
app.use('/app', ventaRoutes(conexion));



