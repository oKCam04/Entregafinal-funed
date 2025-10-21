const {docente, persona} = require('../models');

class DocentesService {
    static async listarDocentes() {
        try {
            return await docente.findAll({
                include: [{
                    model: persona,
                    as: 'persona',
                    attributes: ['id','nombre','apellido','numero_identificacion','tipo_identificacion','fecha_nacimiento','telefono','correo','rol']
                }]
            });
        } catch (error) {
            console.log("Error en servicio al listar docentes");
            
        }
    }

    static async obtenerDocentePorId(id) {
        try {
            const d = await docente.findByPk(id, {
                include: [{
                    model: persona,
                    as: 'persona',
                    attributes: ['id','nombre','apellido','numero_identificacion','tipo_identificacion','fecha_nacimiento','telefono','correo','rol']
                }]
            });
            if (!d) {
                throw new Error('Docente no encontrado');
            }
            return d;
        } catch (error) {
            console.log("Error en servicio al obtener docente por id"+ (error?.message ? `: ${error.message}` : ''));
            throw error;
        }
    }

    // Obtener docente por id_persona con información completa de la persona
    static async obtenerDocentePorIdPersona(id_persona) {
        try {
            const d = await docente.findOne({
                where: { id_persona },
                include: [{
                    model: persona,
                    as: 'persona',
                    attributes: ['id','nombre','apellido','numero_identificacion','tipo_identificacion','fecha_nacimiento','telefono','correo','rol']
                }]
            });
            if (!d) {
                throw new Error('Docente no encontrado para la persona indicada');
            }
            return d;
        } catch (error) {
            console.log("Error en servicio al obtener docente por id_persona"+ (error?.message ? `: ${error.message}` : ''));
            throw error;
        }
    }

    static async crearDocente(id_persona, especialidad, fecha_contratacion, fecha_terminacion) {
        try {
            const nuevo = await docente.create({ id_persona, especialidad, fecha_contratacion, fecha_terminacion });
            // Al crear un docente, actualizar el rol de la persona a 'Docente'
            try {
                if (id_persona) {
                    const p = await persona.findByPk(id_persona);
                    if (p) {
                        await p.update({ rol: 'Docente' });
                    }
                }
            } catch (sideErr) {
                console.log("Advertencia: no se pudo actualizar el rol de la persona a Docente", sideErr?.message || sideErr);
            }
            return nuevo;
        } catch (error) {
            console.log("Error en servicio al crear docente"+error.message);
        }
    }

    static async actualizarDocente(id, id_persona, especialidad, fecha_contratacion, fecha_terminacion) {
        try {
            const docentes = await docente.findByPk(id);
            if (!docentes) {
                throw new Error('Docente no encontrado');
            }
            await docentes.update({ id_persona, especialidad, fecha_contratacion, fecha_terminacion });
            return docentes;
        } catch (error) {
            console.log("Error en servicio al actualizar docente"+error.message);
        }
    }

    static async eliminarDocente(id) {
        try {
            const docentes = await docente.findByPk(id);
            if (!docentes) {
                throw new Error('Docente no encontrado');
            }
            return await docentes.destroy();
        } catch (error) {
            console.log("Error en servicio al eliminar docente");
        }
    }
}
module.exports = DocentesService;