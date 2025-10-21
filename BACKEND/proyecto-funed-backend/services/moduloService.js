const { modulo, modulodocente, docente, persona, ofertacurso, curso } = require('../models');
const { Op } = require('sequelize');
const DocentesService = require('./docentesServices');

class ModuloService {
    static async listarModulos() {
        try {
            return await modulo.findAll();
        } catch (error) {
            throw new Error("Error al listar modulos: " + error.message);
        }
    }

    static async crearModulo(moduloData) {
        try {
            if (Array.isArray(moduloData)) {
                return await modulo.bulkCreate(moduloData);
            }
            return await modulo.create(moduloData);
        } catch (error) {
            throw new Error("Error al crear modulo: " + error.message);
        }
    }

    static async actualizarModulo(id, data) {
        try {
            const modulos = await modulo.findByPk(id);
            if (!modulos) {
                throw new Error("Modulo no encontrado");
            }
            return await modulos.update(data);
        } catch (error) {
            throw new Error("Error al actualizar modulo: " + error.message);
        }
    }

    static async eliminarModulo(id) {
        try {
            const modulos = await modulo.findByPk(id);
            if (!modulos) {
                throw new Error("Modulo no encontrado");
            }
            return await modulos.destroy();
        } catch (error) {
            throw new Error("Error al eliminar modulo: " + error.message);
        }
    }

    static async buscarModuloPorId(id) {
        try {
            const moduloEncontrado = await modulo.findByPk(id);
            if (!moduloEncontrado) {
                throw new Error("Modulo no encontrado");
            }
            return moduloEncontrado;
        } catch (error) {
            throw new Error("Error al buscar modulo por ID: " + error.message);
        }
    }

    static async listarModulosPorOfertaCurso(id_oferta_curso) {
        try {
            const registros = await modulodocente.findAll({
                where: { id_oferta_curso },
                // Limitar atributos para evitar seleccionar columnas inexistentes como 'resultado'
                attributes: ['id', 'id_modulo', 'id_oferta_curso'],
                include: [
                    {
                        model: modulo,
                        as: 'modulo',
                        attributes: ['id', 'nombre']
                    },
                    {
                        model: docente,
                        as: 'docente',
                        attributes: ['id', 'id_persona'],
                        include: [
                            {
                                model: persona,
                                as: 'persona',
                                attributes: ['id', 'nombre', 'apellido']
                            }
                        ]
                    }
                ]
            });

            // Deduplicar por id de módulo y devolver solo datos del módulo
            const vistos = new Set();
            const modulos = [];
            for (const r of registros) {
                if (r.modulo && !vistos.has(r.modulo.id)) {
                    vistos.add(r.modulo.id);
                    const fullName = r.docente?.persona
                        ? `${r.docente.persona.nombre} ${r.docente.persona.apellido}`
                        : null;
                    modulos.push({
                        id: r.modulo.id,
                        nombre: r.modulo.nombre,
                        docenteId: r.docente?.id || null,
                        docenteNombre: fullName
                    });
                }
            }
            return modulos;
        } catch (error) {
            throw new Error("Error al obtener módulos por oferta de curso: " + error.message);
        }
    }

    // Listar módulos por curso/oferta para un docente resolviendo por id_persona
    static async listarModulosPorDocentePersona(id_persona) {
        try {
            // Resolver docente desde persona
            let docenteRecord;
            try {
                docenteRecord = await DocentesService.obtenerDocentePorIdPersona(id_persona);
            } catch (_) {
                // Si la persona no es docente o no existe, devolver lista vacía
                return [];
            }

            const id_docente = docenteRecord.id;

            // Traer asignaciones módulo-docente para este docente
            const registros = await modulodocente.findAll({
                where: { id_docente },
                attributes: ['id', 'id_oferta_curso', 'id_modulo'],
                include: [
                    { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] }
                ]
            });

            if (!registros || registros.length === 0) return [];

            // Obtener las ofertas involucradas y sus cursos
            const ofertaIds = Array.from(new Set((registros || []).map(r => r.id_oferta_curso).filter(Boolean)));
            const ofertas = await ofertacurso.findAll({
                where: { id: { [Op.in]: ofertaIds } },
                attributes: ['id', 'codigo_curso', 'id_curso', 'fecha_inicio_curso', 'fecha_fin_curso', 'horario'],
                include: [
                    { model: curso, as: 'curso', attributes: ['id', 'nombre_curso', 'duracion', 'tipo_curso'] }
                ]
            });

            const ofertasById = new Map();
            for (const o of (ofertas || [])) ofertasById.set(o.id, o);

            // Agrupar módulos por oferta/curso
            const grouped = new Map();
            for (const r of registros) {
                const offerId = r.id_oferta_curso;
                if (!grouped.has(offerId)) {
                    const o = ofertasById.get(offerId) || null;
                    grouped.set(offerId, {
                        curso: o?.curso
                            ? {
                                id: o.curso.id,
                                nombre_curso: o.curso.nombre_curso,
                                duracion: o.curso.duracion,
                                tipo_curso: o.curso.tipo_curso,
                              }
                            : null,
                        oferta: o
                            ? {
                                id: o.id,
                                codigo_curso: o.codigo_curso,
                                fecha_inicio_curso: o.fecha_inicio_curso,
                                fecha_fin_curso: o.fecha_fin_curso,
                                horario: o.horario,
                              }
                            : null,
                        modulos: [],
                    });
                }
                const mod = r.modulo ? { id: r.modulo.id, nombre: r.modulo.nombre } : null;
                if (mod) grouped.get(offerId).modulos.push(mod);
            }

            return Array.from(grouped.values());
        } catch (error) {
            throw new Error("Error al obtener módulos por docente/persona: " + error.message);
        }
    }

    // Listar módulos asignados a un docente (resuelto por id_persona) para una oferta específica
    static async listarModulosPorDocenteOferta(id_persona, id_oferta_curso) {
        try {
            // Resolver docente desde persona
            let docenteRecord;
            try {
                docenteRecord = await DocentesService.obtenerDocentePorIdPersona(id_persona);
            } catch (_) {
                return [];
            }
            const id_docente = docenteRecord.id;

            // Buscar asignaciones específicas por docente y oferta
            const registros = await modulodocente.findAll({
                where: { id_docente, id_oferta_curso },
                attributes: ['id', 'id_oferta_curso', 'id_modulo'],
                include: [
                    { model: modulo, as: 'modulo', attributes: ['id', 'nombre'] }
                ]
            });

            // Deduplicar módulos por id
            const vistos = new Set();
            const modulos = [];
            for (const r of (registros || [])) {
                const m = r.modulo ? { id: r.modulo.id, nombre: r.modulo.nombre } : null;
                if (m && !vistos.has(m.id)) {
                    vistos.add(m.id);
                    modulos.push(m);
                }
            }
            return modulos;
        } catch (error) {
            throw new Error("Error al obtener módulos por docente y oferta: " + error.message);
        }
    }
}

module.exports = ModuloService;