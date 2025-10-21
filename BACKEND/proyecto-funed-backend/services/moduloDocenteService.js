const { modulodocente, modulo, docente, persona } = require('../models');
const CalificacionesService = require('./calificacionesService');

class ModuloDocenteService {
  static async listarTodos() {
    try {
      const registros = await modulodocente.findAll({
        attributes: ['id', 'id_oferta_curso', 'id_modulo', 'id_docente'],
        include: [
          { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] },
          {
            model: docente,
            as: 'docente',
            attributes: ['id', 'id_persona'],
            include: [{ model: persona, as: 'persona', attributes: ['id', 'nombre', 'apellido'] }]
          }
        ]
      })

      return registros.map(r => ({
        id: r.id,
        id_oferta_curso: r.id_oferta_curso,
        id_modulo: r.id_modulo,
        id_docente: r.id_docente,
        resultado: r.resultado,
        modulo: r.modulo ? { id: r.modulo.id, nombre: r.modulo.nombre } : null,
        docente: r.docente ? { id: r.docente.id, persona: r.docente.persona ? { id: r.docente.persona.id, nombre: r.docente.persona.nombre, apellido: r.docente.persona.apellido } : null } : null,
        docenteNombre: r.docente?.persona ? `${r.docente.persona.nombre} ${r.docente.persona.apellido}` : null
      }))
    } catch (error) {
      throw new Error('Error al listar módulo-docente: ' + error.message)
    }
  }
  static async listarPorOfertaCurso(id_oferta_curso) {
    try {
      const registros = await modulodocente.findAll({
        where: { id_oferta_curso },
        attributes: ['id', 'id_oferta_curso', 'id_modulo', 'id_docente'],
        include: [
          { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] },
          {
            model: docente,
            as: 'docente',
            attributes: ['id', 'id_persona'],
            include: [{ model: persona, as: 'persona', attributes: ['id', 'nombre', 'apellido'] }]
          }
        ]
      });

      // Mapear respuesta a estructura clara
      return registros.map(r => ({
        id: r.id,
        id_oferta_curso: r.id_oferta_curso,
        id_modulo: r.id_modulo,
        id_docente: r.id_docente,
        modulo: r.modulo ? { id: r.modulo.id, nombre: r.modulo.nombre } : null,
        docente: r.docente
          ? {
              id: r.docente.id,
              persona: r.docente.persona
                ? { id: r.docente.persona.id, nombre: r.docente.persona.nombre, apellido: r.docente.persona.apellido }
                : null
            }
          : null,
        docenteNombre: r.docente?.persona ? `${r.docente.persona.nombre} ${r.docente.persona.apellido}` : null
      }));
    } catch (error) {
      throw new Error('Error al listar módulo-docente por oferta de curso: ' + error.message);
    }
  }

  static async crearAsignacion({ id_modulo, id_docente, id_oferta_curso }) {
    try {
      console.log('[ModuloDocenteService] crearAsignacion inicio', { id_modulo, id_docente, id_oferta_curso });
      // Crear registro
      const created = await modulodocente.create({
        id_modulo,
        id_docente,
        id_oferta_curso,
        resultado: 'Pendiente',
      });

      // Traer con include para devolver datos amigables
      const r = await modulodocente.findByPk(created.id, {
        attributes: ['id', 'id_oferta_curso', 'id_modulo', 'id_docente'],
        include: [
          { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] },
          {
            model: docente,
            as: 'docente',
            attributes: ['id', 'id_persona'],
            include: [{ model: persona, as: 'persona', attributes: ['id', 'nombre', 'apellido'] }]
          }
        ]
      });

      // Crear notas 'Pendiente' para todos los matriculados activos de la oferta
      let notasResumen = { creadas: 0, totalMatriculas: 0 };
      try {
        notasResumen = await CalificacionesService.crearNotasMasivasPorModuloOferta(id_modulo, id_oferta_curso);
        console.log('[ModuloDocenteService] crearNotasMasivasPorModuloOferta resumen', notasResumen);
      } catch (e) {
        // No romper la creación de asignación si falla la creación masiva; se informa de todas formas
        notasResumen = { error: e.message };
        console.log('[ModuloDocenteService] crearNotasMasivasPorModuloOferta error', e?.message || e);
      }

      return {
        id: r.id,
        id_oferta_curso: r.id_oferta_curso,
        id_modulo: r.id_modulo,
        id_docente: r.id_docente,
        modulo: r.modulo ? { id: r.modulo.id, nombre: r.modulo.nombre } : null,
        docente: r.docente
          ? {
              id: r.docente.id,
              persona: r.docente.persona
                ? { id: r.docente.persona.id, nombre: r.docente.persona.nombre, apellido: r.docente.persona.apellido }
                : null
            }
          : null,
        docenteNombre: r.docente?.persona ? `${r.docente.persona.nombre} ${r.docente.persona.apellido}` : null,
        notasResumen
      };
    } catch (error) {
      console.log('[ModuloDocenteService] crearAsignacion error', error?.message || error);
      throw new Error('Error al crear asignación módulo-docente: ' + error.message);
    }
  }

  static async obtenerPorId(id) {
    try {
      const r = await modulodocente.findByPk(id, {
        attributes: ['id', 'id_oferta_curso', 'id_modulo', 'id_docente'],
        include: [
          { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] },
          {
            model: docente,
            as: 'docente',
            attributes: ['id', 'id_persona'],
            include: [{ model: persona, as: 'persona', attributes: ['id', 'nombre', 'apellido'] }]
          }
        ]
      })
      if (!r) return null
      return {
        id: r.id,
        id_oferta_curso: r.id_oferta_curso,
        id_modulo: r.id_modulo,
        id_docente: r.id_docente,
        resultado: r.resultado,
        modulo: r.modulo ? { id: r.modulo.id, nombre: r.modulo.nombre } : null,
        docente: r.docente ? { id: r.docente.id, persona: r.docente.persona ? { id: r.docente.persona.id, nombre: r.docente.persona.nombre, apellido: r.docente.persona.apellido } : null } : null,
        docenteNombre: r.docente?.persona ? `${r.docente.persona.nombre} ${r.docente.persona.apellido}` : null
      }
    } catch (error) {
      throw new Error('Error al obtener módulo-docente: ' + error.message)
    }
  }

  static async actualizarAsignacion(id, changes) {
    try {
      const allowed = ['id_modulo', 'id_docente', 'id_oferta_curso']
      const payload = {}
      for (const k of allowed) if (typeof changes[k] !== 'undefined') payload[k] = changes[k]
      const [count] = await modulodocente.update(payload, { where: { id } })
      if (!count) return null
      return await this.obtenerPorId(id)
    } catch (error) {
      throw new Error('Error al actualizar módulo-docente: ' + error.message)
    }
  }

  static async eliminarAsignacion(id) {
    try {
      const count = await modulodocente.destroy({ where: { id } })
      return count > 0
    } catch (error) {
      throw new Error('Error al eliminar módulo-docente: ' + error.message)
    }
  }
}

module.exports = ModuloDocenteService;