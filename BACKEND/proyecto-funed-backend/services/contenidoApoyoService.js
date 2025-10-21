const { contenidoapoyo, ofertacurso } = require('../models');

class ContenidoApoyoService {
  static async listarContenidoApoyo() {
    try {
      return await contenidoapoyo.findAll({
        attributes: ['id', 'id_oferta_curso', 'titulo', 'descripcion', 'url_contenido'],
        include: [
          { model: ofertacurso, as: 'oferta', attributes: ['id', 'codigo_curso'] }
        ]
      });
    } catch (error) {
      throw new Error('Error al listar contenido de apoyo: ' + error.message);
    }
  }

  static async crearContenidoApoyo(data) {
    try {
      return await contenidoapoyo.create(data);
    } catch (error) {
      throw new Error('Error al crear contenido de apoyo: ' + error.message);
    }
  }

  static async actualizarContenidoApoyo(id, data) {
    try {
      const registro = await contenidoapoyo.findByPk(id);
      if (!registro) throw new Error('Contenido de apoyo no encontrado');
      return await registro.update(data, { silent: true });
    } catch (error) {
      throw new Error('Error al actualizar contenido de apoyo: ' + error.message);
    }
  }

  static async eliminarContenidoApoyo(id) {
    try {
      const registro = await contenidoapoyo.findByPk(id);
      if (!registro) throw new Error('Contenido de apoyo no encontrado');
      return await registro.destroy();
    } catch (error) {
      throw new Error('Error al eliminar contenido de apoyo: ' + error.message);
    }
  }

  static async obtenerContenidoApoyoPorId(id) {
    try {
      const registro = await contenidoapoyo.findByPk(id, {
        attributes: ['id', 'id_oferta_curso', 'titulo', 'descripcion', 'url_contenido'],
        include: [
          { model: ofertacurso, as: 'oferta', attributes: ['id', 'codigo_curso'] }
        ]
      });
      if (!registro) throw new Error('Contenido de apoyo no encontrado');
      return registro;
    } catch (error) {
      throw new Error('Error al obtener contenido de apoyo por ID: ' + error.message);
    }
  }

  static async listarPorOfertaCurso(id_oferta_curso) {
    try {
      return await contenidoapoyo.findAll({
        where: { id_oferta_curso },
        attributes: ['id', 'id_oferta_curso', 'titulo', 'descripcion', 'url_contenido'],
        include: [
          { model: ofertacurso, as: 'oferta', attributes: ['id', 'codigo_curso'] }
        ]
      });
    } catch (error) {
      throw new Error('Error al obtener contenido de apoyo por oferta de curso: ' + error.message);
    }
  }
}

module.exports = ContenidoApoyoService;