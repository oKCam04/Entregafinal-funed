const ContenidoApoyoService = require('../services/contenidoApoyoService');

class ContenidoApoyoController {
  static async listarContenidoApoyo(req, res) {
    try {
      const lista = await ContenidoApoyoService.listarContenidoApoyo();
      res.json(lista);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar contenido de apoyo', error: error.message });
    }
  }

  static async crearContenidoApoyo(req, res) {
    try {
      const nuevo = await ContenidoApoyoService.crearContenidoApoyo(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear contenido de apoyo', error: error.message });
    }
  }

  static async actualizarContenidoApoyo(req, res) {
    const { id } = req.params;
    try {
      const actualizado = await ContenidoApoyoService.actualizarContenidoApoyo(id, req.body);
      res.json(actualizado);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar contenido de apoyo', error: error.message });
    }
  }

  static async eliminarContenidoApoyo(req, res) {
    const { id } = req.params;
    try {
      await ContenidoApoyoService.eliminarContenidoApoyo(id);
      res.json({ mensaje: 'Contenido de apoyo eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar contenido de apoyo', error: error.message });
    }
  }

  static async obtenerContenidoApoyoPorId(req, res) {
    const { id } = req.params;
    try {
      const registro = await ContenidoApoyoService.obtenerContenidoApoyoPorId(id);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener contenido de apoyo por ID', error: error.message });
    }
  }

  static async obtenerPorOferta(req, res) {
    const { id_oferta_curso } = req.params;
    try {
      const registros = await ContenidoApoyoService.listarPorOfertaCurso(id_oferta_curso);
      res.status(200).json({ mensaje: 'Contenidos de apoyo obtenidos correctamente', contenidos: registros });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener contenido de apoyo por oferta de curso', error: error.message });
    }
  }
}

module.exports = ContenidoApoyoController;