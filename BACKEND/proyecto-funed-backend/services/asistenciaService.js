const {asistencia}= require('../models');

class AsistenciaService {
    static async GetAll() {
        try {
            return await asistencia.findAll();
        } catch (error) {
            console.log("Error en servicio al listar asistencias:", error.message);
            throw error;
        }
    }

    static async Create({ id_curso_matriculado, id_persona, asistio, fecha }) {
        try {
            return await asistencia.create({ id_curso_matriculado, id_persona, asistio, fecha });
        } catch (error) {
            console.log("Error en servicio al crear asistencia:", error.message);
            throw error;
        }
    }

    static async Update(id, cambios) {
        try {
            const data = await asistencia.findByPk(id);
            if (!data) {
                throw new Error(`Asistencia con id=${id} no encontrada`);
            }
            return await data.update(cambios);
        } catch (error) {
            console.log("Error en servicio al actualizar asistencia:", error.message);
            throw error;
        }
    }

    static async Delete(id) {
        try {
            const data = await asistencia.findByPk(id);
            if (!data) {
                throw new Error(`Asistencia con id=${id} no encontrada`);
            }
            return await data.destroy();
        } catch (error) {
            console.log("Error en servicio al eliminar asistencia:", error.message);
            throw error;
        }
    }

    static async GetForId(id) {
        try {
            const data = await asistencia.findByPk(id);
            if (!data) {
                throw new Error(`Asistencia con id=${id} no encontrada`);
            }
            return data;
        } catch (error) {
            console.log("Error en servicio al buscar asistencia por ID:", error.message);
            throw error;
        }
    }

    static async GetForPersonaCurso(id_persona, id_curso_matriculado) {
        try {
            return await asistencia.findAll({
                where: { id_persona, id_curso_matriculado },
                order: [['fecha', 'ASC']]
            });
        } catch (error) {
            console.log("Error en servicio al listar asistencias por persona y curso:", error.message);
            throw error;
        }
    }
}

module.exports = AsistenciaService;