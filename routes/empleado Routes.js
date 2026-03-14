const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    //--------------------------------------//
    //metodo para mostrar todos los empleados//
    //---------------------------------------//

    ruta.get('/empleados', (req, res) => {
        const sql = 'SELECT * FROM empleado'

        conexion.query(sql, (error, empleados) => {

            if (error) {
                console.error('error al obtener los empleados;', error);
                return res.status(500).json({
                    mensaje: 'error interno del servidor'
                });
            }

            res.status(200).json({
                mensaje: 'lista de empleados obtenida exitosamente',
                Total: empleados.length,
                empleados
            });

        });

    });

    //--------------------------------------//
    //metodo para mostrar empleados por id//
    //---------------------------------------//
    ruta.get('/empleados/:id', (req, res) => {
        const empleadoId = req.params.id;

        const sql = 'SELECT * FROM empleado WHERE idEmpleado = ?';

        conexion.query(sql, [empleadoId], (error, resultado) => {
            if (error) {
                console.error('Error al buscar empleado:', error);
                return res.status(500).json({
                    mensaje: 'Error interno del servidor al buscar el empleado.'
                });
            }

            if (resultado.length === 0) {
                return res.status(404).json({
                    mensaje: `Empleado con ID ${empleadoId} no encontrado.`
                });
            }

            res.status(200).json({
                mensaje: `Detalles del empleado ${empleadoId} obtenidos.`,
                empleado: resultado[0]
            });
        });
    });


    //--------------------------------------//
    //metodo para crear empleados (post /api/empleados//
    //---------------------------------------//

    ruta.post('/empleados', (req, res) => {

        //obtenemos los datos del cuerpo de la peticion
        const { nombre, rol, usuario, password } = req.body
        // validaciom de campos obliatorios   
        if (!nombre || !rol || !usuario || !password) {
            return res.status(400).json({
                mensaje: 'faltan campos requeridos: nombre, rol, usuario y password'
            })
        }

        const sql = 'INSERT INTO empleado (nombre, rol, usuario, password) VALUES (?, ?, ?, ?)'
        const params = [nombre, rol, usuario, password];

        conexion.query(sql, params, (error, resultado) => {
            //manejo de errores
            if (error) {
                console.error('error al crear el empleado, error');
                if (error.code === 'ER_DUP_ENTRY') {
                    return req.status(400).json({
                        mensaje: 'El usuario ya existe'
                    })
                }

                return res.status(500).json({
                    mensaje: 'Error interno del servidor',
                    error: error.message
                });
            }
            //respuesta exitosa
            res.status(201).json({
                mensaje: 'empleado registrado exitosamente',
                idEmpleado: resultado.insertId,
                empleado: { nombre, rol, usuario }
            })

        })
    })

    //--------------------------------------//
    //metodo para actualizar empleados (post /api/empleados//
    //---------------------------------------//
    ruta.put('/empleados/:idEmpleado', (req, res) => { 
        const { idEmpleado } = req.params; 
        const { nombre, rol, usuario, password } = req.body; 
        
        // Validación de campos obligatorios 
        if (!nombre || !rol || !usuario || !password) {
            return res.status(400).json({ 
                mensaje: 'Faltan campos requeridos: nombre, rol, usuario y password' 
            }); 
        } 
        
        const sql = 'UPDATE empleado SET nombre = ?, rol = ?, usuario = ?, password = ? WHERE idEmpleado = ?'; 
        const params = [nombre, rol, usuario, password, idEmpleado]; 
        
        conexion.query(sql, params, (error, resultado) => { 
            if (error) { 
                console.error('Error al actualizar el empleado:', error); 
                if (error.code === 'ER_DUP_ENTRY') { 
                    return res.status(400).json({ 
                        mensaje: 'El usuario ya existe' 
                    }); 
                } 
                return res.status(500).json({ 
                    mensaje: 'Error interno del servidor', 
                    error: error.message 
                }); 
            } 
            
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ 
                    mensaje: 'Empleado no encontrado' }); 
                } 
                
                res.status(200).json({ 
                    mensaje: 'Empleado actualizado exitosamente', 
                    empleado: { idEmpleado, nombre, rol, usuario } 
                });
             }); 
            });
    //--------------------------------------//
    //metodo para elimininar empleados (DELETE /api/empleados/:id)
    //---------------------------------------//
    ruta.delete('/empleados/:idEmpleado', (req, res) => {
        const { idEmpleado } = req.params;

        const sql = 'DELETE FROM empleado WHERE idEmpleado = ?';

        conexion.query(sql, [idEmpleado], (error, resultado) => {
            if (error) {
              console.error('Error al eliminar el empleado:', error);
              return res.status(500).json({
                mensaje: 'Error interno del servidor',
                error: error.message
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Empleado eliminado exitosamente',
            idEmpleado
        });
    });
});

            



    return ruta;
}