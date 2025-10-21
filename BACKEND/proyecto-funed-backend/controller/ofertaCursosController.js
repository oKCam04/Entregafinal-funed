const ofertaCursosService = require('../services/ofertaCursoServices');
const docentesService = require('../services/docentesServices');

class OfertaCursosController {
    static async listarOfertasCursos(req, res) {
        try {
            const ofertasCursosLista = await ofertaCursosService.listarOfertasCursos();
            res.json(ofertasCursosLista);
        } catch (error) {
            res.status(500).json({ message: "Error al listar ofertas de cursos" });
        }
    }

    static async crearOfertaCurso(req, res) {
        const { codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto } = req.body;
        try {
            const nuevaOfertaCurso = await ofertaCursosService.crearOfertaCurso(codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio, foto );
            res.status(201).json(nuevaOfertaCurso);
        } catch (error) {
            res.status(500).json({ message: "Error al crear oferta de curso" });
        }
    }

    static async actualizarOfertaCurso(req, res) {
        const { id } = req.params;
        const { codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto  } = req.body;
        try {
            const ofertaCursoActualizada = await ofertaCursosService.actualizarOfertaCurso(id, codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto );
            res.json(ofertaCursoActualizada);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar oferta de curso" });
        }
    }

    static async eliminarOfertaCurso(req, res) {
        const { id } = req.params;
        try {
            await ofertaCursosService.eliminarOfertaCurso(id);
            res.json({ mensaje: "Oferta de curso eliminada exitosamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar oferta de curso" });
        }
    }
    static async obtenerOfertaCursoPorId(req, res) {
        const { id } = req.params;
        try {
            const ofertaCurso = await ofertaCursosService.obtenerOfertaCursoPorId(id);
            res.json(ofertaCurso);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener oferta de curso" });
        }
    }

    static async obtenerOfertasPorDocente(req, res) {
        const { id_persona } = req.params;
        try {
            let docente;
            try {
                docente = await docentesService.obtenerDocentePorIdPersona(Number(id_persona));
            } catch (err) {
                // Si la persona no es docente, retornamos lista vacía
                return res.json([]);
            }
            const ofertas = await ofertaCursosService.listarOfertasPorDocente(Number(docente.id));
            res.json(ofertas);
        } catch (error) {
            res.status(500).json({ message: "Error al listar ofertas por docente" });
        }
    }

}

module.exports = OfertaCursosController;