const { pago, persona, cursomatriculado, ofertacurso, curso } = require('../models');

class PagoService {
    static async GetAll() {
        try {
            return await pago.findAll({
                include: [
                    {
                        model: persona,
                        as: 'persona',
                        attributes: ['id', 'nombre', 'apellido', 'numero_identificacion', 'correo', 'telefono']
                    },
                    {
                        model: cursomatriculado,
                        as: 'cursoMatriculado',
                        attributes: ['id', 'estado', 'resultado', 'id_curso_oferta', 'id_persona'],
                        include: [
                            {
                                model: ofertacurso,
                                as: 'curso',
                                attributes: ['id', 'codigo_curso', 'fecha_inicio_curso', 'fecha_fin_curso', 'horario', 'cupos', 'precio'],
                                include: [
                                    {
                                        model: curso,
                                        as: 'curso',
                                        attributes: ['id', 'nombre_curso', 'duracion', 'tipo_curso']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        } catch (error) {
            console.log("Error en servicio al listar pagos:", error.message);
            throw error;
        }
    }

    static async Create(pagoData) {
        try {
            return await pago.create(pagoData);
        } catch (error) {
            console.log("Error en servicio al crear pago:", error.message);
            throw error;
        }
    }

    static async Update(id, cambios) {
        try {
            const datos = await pago.findByPk(id);
            if (!datos) {
                throw new Error(`Pago con id=${id} no encontrado`);
            }
            return await datos.update(cambios);
        } catch (error) {
            console.log("Error en servicio al actualizar pago:", error.message);
            throw error;
        }
    }

    static async Delete(id) {
        try {
            const datos = await pago.findByPk(id);
            if (!datos) {
                throw new Error(`Pago con id=${id} no encontrado`);
            }
            return await datos.destroy();
        } catch (error) {
            console.log("Error en servicio al eliminar pago:", error.message);
            throw error;
        }
    }

    static async GetForId(id) {
        try {
            const datos = await pago.findByPk(id, {
                include: [
                    {
                        model: persona,
                        as: 'persona',
                        attributes: ['id', 'nombre', 'apellido', 'numero_identificacion', 'correo', 'telefono']
                    },
                    {
                        model: cursomatriculado,
                        as: 'cursoMatriculado',
                        attributes: ['id', 'estado', 'resultado', 'id_curso_oferta', 'id_persona'],
                        include: [
                            {
                                model: ofertacurso,
                                as: 'curso',
                                attributes: ['id', 'codigo_curso', 'fecha_inicio_curso', 'fecha_fin_curso', 'horario', 'cupos', 'precio'],
                                include: [
                                    {
                                        model: curso,
                                        as: 'curso',
                                        attributes: ['id', 'nombre_curso', 'duracion', 'tipo_curso']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (!datos) {
                throw new Error(`Pago con id=${id} no encontrado`);
            }
            return datos;
        } catch (error) {
            console.log("Error en servicio al buscar pago por ID:", error.message);
            throw error;
        }
    }
}; 

module.exports = PagoService;
