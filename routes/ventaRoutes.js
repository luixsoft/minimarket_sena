module.exports = (conexion) => {
    const express = require('express');
    const ruta = express.Router();

    // Endpoint para registrar una venta con transacción
    ruta.post('/ventas', async (req, res) => {
        const { idEmpleado, idCliente, metodoPago, productos } = req.body;
        // Validación de datos
        if (!idEmpleado || !metodoPago || !productos || productos.length === 0) {
            return res.status(400).send({
                message: 'Datos de venta incompletos, al menos un producto para la venta'
            });
        }

        // Calcular total a pagar
        let totalPagar = 0;
        for (const item of productos) {
            if (!item.idProducto || !item.cantidad || !item.precioUnitario || item.cantidad <= 0) {
                return res.status(400).send({
                    message: 'Detalles del producto inválidos'
                });
            }
            totalPagar += item.cantidad * item.precioUnitario;
        }

        // Función auxiliar para promesas
        const queryPromise = (sql, values) => {
            return new Promise((resolve, reject) => {
                conexion.query(sql, values, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };

        try {
            // Iniciar transacción
            await queryPromise('START TRANSACTION');

            // Insertar venta
            const fechaHora = new Date().toISOString().slice(0, 19).replace('T', ' ');


            const ventaData = {
                fechaHora: new Date(),
                totalPagar: totalPagar.toFixed(2),
                metodoPago: metodoPago,
                estado: 'FINALIZADA',
                idEmpleado: idEmpleado,
                idCliente: idCliente
            };

            const insertVentaSql = 'INSERT INTO venta SET ?';
            const ventaResult = await queryPromise(insertVentaSql, ventaData);
            const idventa = ventaResult.insertId;

            // Insertar detalles y actualizar inventario
            for (const item of productos) {
                const detalleData = {
                id_venta: idventa,
                id_producto: item.idProducto,
                cantidad: item.cantidad,
                precio_unitario: item.precioUnitario
                // 👈 subtotal NO se inserta, MySQL lo calcula automáticamente
            };

            const insertDetalleSql = 'INSERT INTO detalleventa SET ?';
            await queryPromise(insertDetalleSql, detalleData);

            const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Actualizar inventario
            const updateProductoSql =
                "UPDATE producto SET stockActual = stockActual - ?, fechaUltimaActualizacion = ? WHERE idProducto = ?";
            const productoResult = await queryPromise(updateProductoSql, [item.cantidad, fechaActual, item.idProducto]);

            if (productoResult.affectedRows === 0) {
                throw new Error(`Producto ID ${item.idProducto} no encontrado en la tabla producto.`);
            }
        }

        // Confirmar transacción
        await queryPromise('COMMIT');
        
        // Respuesta de éxito
        res.status(201).send({
            message: "Venta registrada exitosamente y stock actualizado.",
            idVenta: idventa,
            totalPagar: totalPagar.toFixed(2)
        });
        
    } catch (error) {
        // Rollback si algo falla
        console.error(`Intentando ROLLBACK debido a un error: ${error.message}`);
        try {
            await queryPromise('ROLLBACK');
        } catch (rollbackError) {
            console.error("Error durante el ROLLBACK:", rollbackError);
        }

        // Respuesta de error
        console.error("Error en la Transacción de Venta:", error.message || error);
        res.status(500).send({
            message: "Falló al procesar la venta. La transacción fue revertida.",
            errorDetails: error.message
        });
    }
});

//--------------------------------------//
    //metodo GET PARA CONSULTAR DETALLE DE VENTA POR ID//
//---------------------------------------//

ruta.get('/ventas/:idVenta',(req, res)=>{
    const idVenta = req.params.idVenta

    //Consulta sql para obtener los productos
    const sql = `
    SELECT
      V.idVenta,
      V.fechaHora,
      V.totalPagar,
      V.metodoPago,
      E.nombre AS nombreEmpleado,
      C.nombre AS nombreCliente,
      DV.cantidad,
      DV.precio_unitario AS precioUnitario,
      DV.subtotal AS subtotalLinea,
      P.nombre AS nombreProducto,
      P.codigoBarra
    FROM venta V
    JOIN empleado E ON V.idEmpleado = E.idEmpleado
    LEFT JOIN cliente C ON V.idCliente = C.idCliente
    JOIN detalleventa DV ON V.idVenta = DV.id_venta
    JOIN producto P ON DV.id_producto = P.idProducto
    WHERE V.idVenta = ?`;


    //Ejecutar la consulta
    conexion.query(sql, [idVenta], (error, filas)=>{

        //manejo de errores
        if (error) {
            console.error(`Error al consultar detalle de venta ${idVenta}:`, error);
            return res.status(500).send({
            message: "Error al consultar el detalle de la venta.",
            errorDetails: error.sqlMessage || error.code
        });
      }

      // venta no encontrada
      // Venta no encontrada
      if (filas.length === 0) {
          return res.status(404).send({
              message: `Venta con ID ${idVenta} no encontrada.`
          });
      }

      // estructurar la respuesta
      const ventaDetalle = {
        idVenta: filas[0].idVenta,
        fechaHora: filas[0].fechaHora,
        totalPagar: filas[0].totalPagar,
        metodoPago: filas[0].metodoPago,
        empleado: filas[0].nombreEmpleado,
        cliente: filas[0].nombreCliente,
        productos: []

      }

      // Extraer detalles de los porductos
      filas.forEach(fila => {
          ventaDetalle.productos.push({
            nombreProducto: fila.nombreProducto,
            codigoBarra: fila.codigoBarra,
            cantidad: fila.cantidad,
            precioUnitario: fila.precioUnitario,
            subtotalLinea: fila.subtotalLinea
          });
        
      });

      //enviar la respuesta estructurada
      res.status(200).send(ventaDetalle);


    })

})



return ruta;
};











    



