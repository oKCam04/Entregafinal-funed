const ModuloService = require("../services/moduloService");

class ModuloController {
    static async listarModulos(req, res) {
        try {
            const modulosLista = await ModuloService.listarModulos();
            res.json(modulosLista);
        } catch (error) {
            res.json({ message: "Error al listar modulos" });
        }
    }

    static async crearModulo(req, res) {
        try {
            const nuevoModulo = await ModuloService.crearModulo(req.body);
            res.json(nuevoModulo);
        } catch (error) {
            res.json({ message: "Error al crear modulo" });
        }
    }

    static async actualizarModulo(req, res) {
        const { id } = req.params;
        try {
            const moduloActualizado = await ModuloService.actualizarModulo(id, req.body);
            res.json(moduloActualizado);
        } catch (error) {
            res.json({ message: "Error al actualizar modulo" });
        }
    }

    static async eliminarModulo(req, res) {
        const { id } = req.params;
        try {
            await ModuloService.eliminarModulo(id);
            res.json({ mensaje: "Modulo eliminado exitosamente" })
        } catch (error) {
            res.json({ message: "Error al eliminar modulo" });
        }
    }

    static async buscarModuloPorId(req, res) {
        const { id } = req.params;
        try {
            const modulo = await ModuloService.buscarModuloPorId(id);
            res.json(modulo);
        } catch (error) {
            res.json({ message: "Error al buscar modulo por ID" });
        }
    }

    static async obtenerModulosPorOfertaCurso(req, res) {
        const { id_oferta_curso } = req.params;
        try {
            const modulos = await ModuloService.listarModulosPorOfertaCurso(id_oferta_curso);
            res.status(200).json({ mensaje: "Módulos obtenidos correctamente", modulos });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al obtener módulos por oferta de curso", error: error.message });
        }
    }

    static async obtenerModulosPorDocentePersona(req, res) {
        const { id_persona } = req.params;
        try {
            const cursos = await ModuloService.listarModulosPorDocentePersona(id_persona);
            res.status(200).json({ mensaje: "Módulos por curso del docente obtenidos", cursos });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al obtener módulos por docente", error: error.message });
        }
    }

    static async obtenerModulosPorDocenteOferta(req, res) {
        const { id_persona, id_oferta_curso } = req.params;
        try {
            const modulos = await ModuloService.listarModulosPorDocenteOferta(id_persona, id_oferta_curso);
            res.status(200).json({ mensaje: "Módulos del docente para la oferta obtenidos", modulos });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al obtener módulos por docente y oferta", error: error.message });
        }
    }
}
module.exports = ModuloController;