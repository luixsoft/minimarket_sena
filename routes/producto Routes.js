const express = require('express');
const ruta = express.Router();

module.exports = function (conexion) {
//--------------------------------------//
//metodo para mostrar todos los productos//
//---------------------------------------//

ruta.get('/producto', (req, res) => {
    const sql = 'SELECT * FROM producto';

    conexion.query(sql, (error, filas) => {
        if (error) {
            console.error('error al obtener los productos', error)

            res.status(500).send({
                message: 'error al consultar los productos',
                detalleError: error.code
            });
            return;
        }

        if (filas.length === 0) {
            res.status(404).send({
                message: 'No se encontraron productos'
            })
        } else {
            res.status(200).send(filas);
        }

    })
});


//metodo para mostrar un productos por id//

ruta.get('/producto/:idProducto', (req, res) => {
    const idProducto = req.params.idProducto;
    const sql = 'SELECT * FROM producto WHERE idProducto = ?';

    conexion.query(sql, [idProducto], (error, fila) => {

        // 1. Manejo de Errores: Error de conexión o SQL (internal server error)
        if (error) {
            console.error(`Error al consultar producto con ID ${idProducto}:`, error);
            res.status(500).send({
                message: `Error al consultar el producto con ID ${idProducto} en la base de datos.`,
                detalleError: error.code
            });
            return;
        }

        // 2. Manejo de Respuesta: Producto no encontrado
        if (fila.length === 0) {
            res.status(404).send({
                message: `Producto con ID ${idProducto} no encontrado.`
            });
        } else {
            // 3. Éxito: Producto encontrado
            res.status(200).send(fila[0]);
        }
    });
});


//metodo para crear un producto //
//-------------------------------------/77

ruta.post('/producto', (req, res) => {
    let datos = {
        nombre: req.body.nombre,
        codigoBarra: req.body.codigoBarra,
        precioVenta: req.body.precioVenta,
        precioCompra: req.body.precioCompra,
        categoria: req.body.categoria,
        unidadMedida: req.body.unidadMedida,
        fechaVencimiento: req.body.fechaVencimiento

    };

    let sql = "INSERT INTO producto SET ?";

    conexion.query(sql, datos, function (error, resultado) {
        if (error) {
            console.error("Error al insertar producto:", error);
            res.status(500).send({
                message: "Error al crear el producto en la base de datos.",
                error: error.code
            });
        } else {
            res.status(201).send({
                message: "Producto creado con éxito",
                idProducto: resultado.insertId
            });
        }
    })
});


//metodo para actualizar o editar  productos //
//-------------------------------------/77

ruta.put('/producto/:idProducto', (req, res) => {
    const idProducto = req.params.idProducto;

    let datos = {
        nombre: req.body.nombre,
        codigoBarra: req.body.codigoBarra,
        precioVenta: req.body.precioVenta,
        precioCompra: req.body.precioCompra,
        categoria: req.body.categoria,
        unidadMedida: req.body.unidadMedida,
        fechaVencimiento: req.body.fechaVencimiento

    };

    let sql = "UPDATE producto SET ? WHERE idProducto = ?";

    conexion.query(sql, [datos, idProducto], function (error, resultado) {
        if (error) {
            console.error("Error al actualizar producto:", error);
            res.status(500).send({
                message: "Error al actualizar el producto en la base de datos.",
                error: error.code
            });
        } else {
            if (resultado.affectedRows === 0) {
                res.status(404).send({
                    message: `Producto con ID ${idProducto} no encontrado.`
                });
            } else {
                res.status(200).send({
                    message: "Producto actualizado con éxito",
                    idProducto: idProducto
                });
            }
        }
    });
});


//metodo para eliminar  productos //
//-------------------------------------/77

ruta.delete('/producto/:idProducto', (req, res) => {
    const idProducto = req.params.idProducto;
    const sql = "DELETE FROM producto WHERE idProducto = ?";

    conexion.query(sql, [idProducto], function (error, resultado) {

        // 1. Manejo de errores de base de datos o conexión (500)

        if (error) {
            console.error(`Error al eliminar producto con ID ${idProducto}:`, error);
            res.status(500).send({
                message: `Error al intentar eliminar el producto con ID ${idProducto}.`,
                detalleError: error.code
            });
            return;
        }

        // 2. Validación de eliminación
        if (resultado.affectedRows === 0) {
            // Error 404: Si no se afectó ninguna fila, el producto no existe
            res.status(404).send({
                message: `No se encontró el producto con ID ${idProducto} para eliminar.`
            });
        } else {
            // Éxito 204: Eliminación exitosa (No Content)
            res.status(204).send(); // No se envía contenido en el cuerpo

        }
    });
});

return ruta;

}

