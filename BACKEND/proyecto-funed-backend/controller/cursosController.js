const CursosService = require('../services/cursosServices');

class CursosController {
    static async listarCursos(req, res) {
        try {
            const cursosLista = await CursosService.listarCursos();
            res.json(cursosLista);
        } catch (error) {
            res.json({ message: "Error al listar cursos" });
        }
    }

    static async crearCurso(req, res) {
        const { nombre_curso, duracion, temario, tipo_curso } = req.body;
        try {
            const nuevoCurso = await CursosService.crearCurso(nombre_curso, duracion, temario, tipo_curso);
            res.json(req.body);
        } catch (error) {
            res.json({ message: "Error al crear curso" });
        }
    }

    static async actualizarCurso(req, res) {
        const { id } = req.params;
        const { nombre_curso, duracion, temario, tipo_curso } = req.body;
        try {
            const cursoActualizado = await CursosService.actualizarCurso(id, nombre_curso, duracion, temario, tipo_curso);
            res.json(cursoActualizado);
        } catch (error) {
            res.json({ message: "Error al actualizar curso" });
        }
    }

    static async eliminarCurso(req, res) {
        const { id } = req.params;
        try {
            await CursosService.eliminarCurso(id);
            res.json({ mensaje: "Curso eliminado exitosamente" });
        } catch (error) {
            res.json({ message: "Error al eliminar curso" });
        }
    }
    static async buscarCursoPorId(req, res) {
        const { id } = req.params;
        try {
            const cursoEncontrado = await CursosService.buscarCursoPorId(id);
            res.json(cursoEncontrado);
        } catch (error) {
            res.json({ message: "Error al buscar curso por ID" });
        }
    }
}
module.exports = CursosController;
