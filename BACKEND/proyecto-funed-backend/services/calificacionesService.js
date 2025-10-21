const { modulo, notas_modulo, cursomatriculado, modulodocente } = require('../models');
const { Op } = require('sequelize');

class CalificacionesService {
  static toEstado(value) {
    if (!value) return value;
    const s = String(value).toLowerCase();
    if (s === 'aprobado' || s.includes('aprob')) return 'Aprobó';
    if (s === 'desaprobado' || s.includes('desapr')) return 'Desaprobó';
    if (s === 'pendiente') return 'Pendiente';
    return value;
  }

  static async upsertNotaModulo({ id_persona, id_oferta_curso, id_modulo, estado, id_curso_matriculado }) {
    try {
      let matricula;
      // Si viene el id_curso_matriculado directamente (modelo), úsalo
      if (id_curso_matriculado) {
        matricula = await cursomatriculado.findByPk(id_curso_matriculado);
        if (!matricula) throw new Error('Matrícula no existe para id_curso_matriculado');
      } else {
        // Caso anterior: derivar la matrícula por persona + oferta
        matricula = await cursomatriculado.findOne({
          where: { id_persona, id_curso_oferta: id_oferta_curso },
        });
        if (!matricula) {
          throw new Error('No existe matrícula para la persona y oferta de curso especificadas');
        }
      }

      const existing = await notas_modulo.findOne({
        where: { id_curso_matriculado: matricula.id, id_modulo },
      });

      const fecha_registro = new Date();
      const estadoBackend = CalificacionesService.toEstado(estado);

      let nota;
      if (existing) {
        nota = await existing.update({ estado: estadoBackend, fecha_registro });
      } else {
        nota = await notas_modulo.create({
          id_curso_matriculado: matricula.id,
          id_modulo,
          estado: estadoBackend,
          fecha_registro,
        });
      }

      return {
        id: nota.id,
        id_curso_matriculado: matricula.id,
        id_persona: matricula.id_persona,
        id_oferta_curso: matricula.id_curso_oferta,
        id_modulo: nota.id_modulo,
        estado: nota.estado,
        fecha_registro: nota.fecha_registro,
      };
    } catch (error) {
      throw new Error('Error al crear/actualizar nota de módulo: ' + error.message);
    }
  }

  static async actualizarNota(id, estado) {
    try {
      const nota = await notas_modulo.findByPk(id);
      if (!nota) throw new Error('Nota no encontrada');
      const fecha_registro = new Date();
      const estadoBackend = CalificacionesService.toEstado(estado);
      const updated = await nota.update({ estado: estadoBackend, fecha_registro });
      return updated;
    } catch (error) {
      throw new Error('Error al actualizar la nota: ' + error.message);
    }
  }

  static async eliminarNota(id) {
    try {
      const nota = await notas_modulo.findByPk(id);
      if (!nota) throw new Error('Nota no encontrada');
      await nota.destroy();
      return { mensaje: 'Nota eliminada correctamente' };
    } catch (error) {
      throw new Error('Error al eliminar la nota: ' + error.message);
    }
  }

  static async actualizarNotaByMatriculaModulo(id_curso_matriculado, id_modulo, estado) {
    try {
      const nota = await notas_modulo.findOne({ where: { id_curso_matriculado, id_modulo } });
      if (!nota) throw new Error('Nota no encontrada para la matrícula y módulo especificados');
      const fecha_registro = new Date();
      const estadoBackend = CalificacionesService.toEstado(estado);
      const updated = await nota.update({ estado: estadoBackend, fecha_registro });
      return updated;
    } catch (error) {
      throw new Error('Error al actualizar la nota por matrícula/módulo: ' + error.message);
    }
  }

  static async listarNotasPorModuloOferta(id_modulo, id_oferta_curso) {
    try {
      const notas = await notas_modulo.findAll({
        where: { id_modulo },
        include: [
          {
            model: cursomatriculado,
            as: 'matricula',
            where: { id_curso_oferta: id_oferta_curso },
            attributes: ['id', 'id_persona', 'id_curso_oferta'],
          },
        ],
      });

      return notas.map((n) => ({
        id_nota: n.id,
        id_persona: n.matricula?.id_persona,
        id_oferta_curso: n.matricula?.id_curso_oferta,
        id_modulo: n.id_modulo,
        estado: n.estado,
        fecha_registro: n.fecha_registro,
      }));
    } catch (error) {
      throw new Error('Error al listar notas por módulo y oferta: ' + error.message);
    }
  }

  static async obtenerNotaPorId(id) {
    try {
      const n = await notas_modulo.findByPk(id, {
        include: [
          { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] },
          { model: cursomatriculado, as: 'matricula', attributes: ['id_persona', 'id_curso_oferta'] },
        ],
      });
      if (!n) throw new Error('Nota no encontrada');
      return {
        id: n.id,
        id_modulo: n.id_modulo,
        estado: n.estado,
        fecha_registro: n.fecha_registro,
        id_persona: n.matricula?.id_persona,
        id_oferta_curso: n.matricula?.id_curso_oferta,
        modulo: n.modulo ? { id: n.modulo.id, nombre: n.modulo.nombre } : null,
      };
    } catch (error) {
      throw new Error('Error al obtener la nota: ' + error.message);
    }
  }

  static async listarTodasNotas(query = {}) {
    try {
      const where = {};
      if (query.id_modulo) where.id_modulo = query.id_modulo;
      const include = [];
      if (query.id_oferta_curso || query.includePersona) {
        const whereMat = {};
        if (query.id_oferta_curso) whereMat.id_curso_oferta = query.id_oferta_curso;
        include.push({
          model: cursomatriculado,
          as: 'matricula',
          where: Object.keys(whereMat).length ? whereMat : undefined,
          attributes: ['id_persona', 'id_curso_oferta'],
        });
      }

      const notas = await notas_modulo.findAll({ where, include });
      return notas.map((n) => ({
        id: n.id,
        id_modulo: n.id_modulo,
        estado: n.estado,
        fecha_registro: n.fecha_registro,
        id_persona: n.matricula?.id_persona,
        id_oferta_curso: n.matricula?.id_curso_oferta,
      }));
    } catch (error) {
      throw new Error('Error al listar notas: ' + error.message);
    }
  }

  static async listarNotasModuloPorEstudianteOferta(id_persona, id_oferta_curso) {
    try {
      const matricula = await cursomatriculado.findOne({
        where: { id_persona, id_curso_oferta: id_oferta_curso },
      });

      if (!matricula) return [];

      const notas = await notas_modulo.findAll({
        where: { id_curso_matriculado: matricula.id },
        include: [
          {
            model: modulo,
            as: 'modulo',
            attributes: ['id', 'nombre'],
          },
        ],
      });

      return notas.map((n) => ({
        id: n.id,
        id_curso_matriculado: n.id_curso_matriculado,
        id_persona: matricula.id_persona,
        id_oferta_curso: matricula.id_curso_oferta,
        modulo: n.modulo ? { id: n.modulo.id, nombre: n.modulo.nombre } : null,
        estado: n.estado,
        fecha_registro: n.fecha_registro,
      }));
    } catch (error) {
      throw new Error('Error al obtener notas por estudiante y oferta de curso: ' + error.message);
    }
  }

  // Crear notas 'Pendiente' para todos los matriculados activos de una oferta cuando se agrega un módulo
  static async crearNotasMasivasPorModuloOferta(id_modulo, id_oferta_curso) {
    try {
      // Matriculas activas para la oferta
      const matriculas = await cursomatriculado.findAll({
        where: { id_curso_oferta: id_oferta_curso, estado: 'Activo' },
        attributes: ['id'],
      });

      if (!matriculas || matriculas.length === 0) {
        return { creadas: 0, totalMatriculas: 0 };
      }

      const idsMatriculas = matriculas.map(m => m.id);

      // Notas ya existentes para ese módulo en esas matrículas
      const existentes = await notas_modulo.findAll({
        where: { id_modulo, id_curso_matriculado: { [Op.in]: idsMatriculas } },
        attributes: ['id_curso_matriculado'],
      });

      const existentesSet = new Set(existentes.map(e => e.id_curso_matriculado));

      const fecha = new Date();
      const aCrear = idsMatriculas
        .filter(idMat => !existentesSet.has(idMat))
        .map(idMat => ({
          id_curso_matriculado: idMat,
          id_modulo,
          estado: 'Pendiente',
          fecha_registro: fecha,
        }));

      let creadas = 0;
      if (aCrear.length > 0) {
        await notas_modulo.bulkCreate(aCrear);
        creadas = aCrear.length;
      }

      const resumen = { creadas, totalMatriculas: idsMatriculas.length };
      if (creadas > 0) {
        console.log(`[NotasMasivas] ✅ Sí, logradoo: se crearon ${creadas}/${idsMatriculas.length} notas (oferta ${id_oferta_curso}, módulo ${id_modulo})`);
      } else {
        console.log(`[NotasMasivas] Sin nuevas notas. Matrículas activas: ${idsMatriculas.length} (oferta ${id_oferta_curso}, módulo ${id_modulo})`);
      }
      return resumen;
    } catch (error) {
      throw new Error('Error al crear notas masivas por módulo y oferta: ' + error.message);
    }
  }

  // Crear notas 'Pendiente' para una matrícula activa por todos los módulos asignados a su oferta
  static async crearNotasPendientesParaMatricula(id_curso_matriculado) {
    try {
      const matricula = await cursomatriculado.findByPk(id_curso_matriculado);
      if (!matricula) throw new Error('Matrícula no encontrada');

      // Solo si está Activo
      if (matricula.estado !== 'Activo') {
        return { creadas: 0, totalModulos: 0 };
      }

      const id_oferta_curso = matricula.id_curso_oferta;

      // Listar módulos asignados a la oferta
      const asignaciones = await modulodocente.findAll({
        where: { id_oferta_curso },
        attributes: ['id_modulo']
      });

      const modulosAsignados = asignaciones.map(a => a.id_modulo);
      if (!modulosAsignados.length) {
        return { creadas: 0, totalModulos: 0 };
      }

      // Notas existentes para la matrícula en esos módulos
      const existentes = await notas_modulo.findAll({
        where: { id_curso_matriculado, id_modulo: { [Op.in]: modulosAsignados } },
        attributes: ['id_modulo']
      });

      const existentesSet = new Set(existentes.map(e => e.id_modulo));
      const fecha = new Date();

      const aCrear = modulosAsignados
        .filter(id_modulo => !existentesSet.has(id_modulo))
        .map(id_modulo => ({
          id_curso_matriculado,
          id_modulo,
          estado: 'Pendiente',
          fecha_registro: fecha,
        }));

      let creadas = 0;
      if (aCrear.length > 0) {
        await notas_modulo.bulkCreate(aCrear);
        creadas = aCrear.length;
      }

      const resumen = { creadas, totalModulos: modulosAsignados.length };
      if (creadas > 0) {
        console.log(`[NotasPendientesMatricula] ✅ Sí, logradoo: se crearon ${creadas}/${modulosAsignados.length} notas (matrícula ${id_curso_matriculado})`);
      } else {
        console.log(`[NotasPendientesMatricula] Sin nuevas notas. Módulos asignados: ${modulosAsignados.length} (matrícula ${id_curso_matriculado})`);
      }
      return resumen;
    } catch (error) {
      throw new Error('Error al crear notas pendientes para matrícula: ' + error.message);
    }
  }
}

module.exports = CalificacionesService;