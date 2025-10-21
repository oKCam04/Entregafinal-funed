const docenteService = require('../services/docentesServices');

class DocenteController {
    static async listarDocentes(req, res) {
        try {
            const docentes = await docenteService.listarDocentes();
            res.status(200).json(docentes);
        } catch (error) {
            console.error("Error al listar docentes:", error);
            res.status(500).json({ message: "Error al listar docentes" });
        }
    }  

    static async obtenerDocentePorId(req, res) {
        const { id } = req.params;
        try {
            const docente = await docenteService.obtenerDocentePorId(id);
            if (!docente) {
                return res.status(404).json({ message: "Docente no encontrado" });
            }
            res.status(200).json(docente);
        } catch (error) {
            console.error("Error al obtener docente:", error);
            const status = (/no encontrado/i.test(error?.message || '')) ? 404 : 500;
            res.status(status).json({ message: "Error al obtener docente" });
        }
    }

    // Obtener docente por id_persona, incluyendo todos los datos de la persona
    static async obtenerDocentePorIdPersona(req, res) {
        const { id_persona } = req.params;
        try {
            const docente = await docenteService.obtenerDocentePorIdPersona(id_persona);
            if (!docente) {
                return res.status(404).json({ message: "Docente no encontrado" });
            }
            res.status(200).json(docente);
        } catch (error) {
            console.error("Error al obtener docente por id_persona:", error);
            const status = (/no encontrado/i.test(error?.message || '')) ? 404 : 500;
            res.status(status).json({ message: "Error al obtener docente por id_persona" });
        }
    }
    static async crearDocente(req, res) {
        const { id_persona, especialidad, fecha_contratacion, fecha_terminacion } = req.body;
        try {
            const nuevoDocente = await docenteService.crearDocente(id_persona, especialidad, fecha_contratacion, fecha_terminacion);
            res.status(201).json(nuevoDocente);
        } catch (error) {
            console.error("Error al crear docente:", error);
            res.status(500).json({ message: "Error al crear docente" });
        }
    }

    static async actualizarDocente(req, res) {
        const { id } = req.params;
        const { id_persona, especialidad, fecha_contratacion, fecha_terminacion } = req.body;
        try {
            const docenteActualizado = await docenteService.actualizarDocente(id, id_persona, especialidad, fecha_contratacion, fecha_terminacion);
            res.status(200).json(docenteActualizado);
        } catch (error) {
            console.error("Error al actualizar docente:", error);
            res.status(500).json({ message: "Error al actualizar docente" });
        }
    }

    static async eliminarDocente(req, res) {
        const { id } = req.params;
        try {
            await docenteService.eliminarDocente(id);
            res.status(204).json({ message: "Docente eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar docente:", error);
            res.status(500).json({ message: "Error al eliminar docente" });
        }
    }
}
module.exports = DocenteController;