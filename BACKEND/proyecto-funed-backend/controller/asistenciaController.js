const AsistenciaService = require('../services/asistenciaService');

class AsistenciaController {
    static async GetAll(req, res) {
        try {
            const data = await AsistenciaService.GetAll();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al listar asistencias", error: error.message });
        }
    }

    static async Create(req, res) {
        try {
            const raw = req.body || {};
            console.log('[AsistenciaController] Create payload recibido:', raw);

            const id_curso_matriculado = raw.id_curso_matriculado != null ? Number(raw.id_curso_matriculado) : undefined;
            const id_persona = raw.id_persona != null ? Number(raw.id_persona) : undefined;
            const asistio = raw.asistio;
            const fecha = raw.fecha;

            console.log('[AsistenciaController] Normalizado:', { id_curso_matriculado, id_persona, asistio, fecha });

            if (!id_curso_matriculado || !id_persona || !asistio || !fecha) {
                console.error('[AsistenciaController] Validación fallida: campos requeridos faltantes');
                return res.status(400).json({
                    message: 'Campos requeridos faltantes',
                    detalle: { id_curso_matriculado, id_persona, asistio, fecha }
                });
            }

            const data = await AsistenciaService.Create({ id_curso_matriculado, id_persona, asistio, fecha });
            res.status(201).json(data);
        } catch (error) {
            console.error('[AsistenciaController] Error en Create:', error);
            const name = error?.name || '';
            if (name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ message: 'Registro de asistencia duplicado', error: error.message });
            }
            if (name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({ message: 'FK inválida en asistencia', error: error.message });
            }
            res.status(500).json({ message: "Error al crear asistencia", error: error.message });
        }
    }

    static async Update(req, res) {
        const { id } = req.params;
        try {
            const raw = req.body || {};
            console.log('[AsistenciaController] Update cambios recibidos:', raw);

            // Normalizar posibles campos numéricos si vienen en el PATCH
            const cambios = { ...raw };
            if (cambios.id_curso_matriculado != null) cambios.id_curso_matriculado = Number(cambios.id_curso_matriculado);
            if (cambios.id_persona != null) cambios.id_persona = Number(cambios.id_persona);

            const data = await AsistenciaService.Update(id, cambios);
            res.json(data);
        } catch (error) {
            console.error('[AsistenciaController] Error en Update:', error);
            const name = error?.name || '';
            if (name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ message: 'Conflicto por duplicado en asistencia', error: error.message });
            }
            if (name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({ message: 'FK inválida en asistencia', error: error.message });
            }
            res.status(500).json({ message: "Error al actualizar asistencia", error: error.message });
        }
    }

    static async Delete(req, res) {
        const { id } = req.params;
        try {
            await AsistenciaService.Delete(id);
            res.json({ mensaje: "Asistencia eliminada exitosamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar asistencia", error: error.message });
        }
    }

    static async GetForId(req, res) {
        const { id } = req.params;
        try {
            const data = await AsistenciaService.GetForId(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al buscar asistencia por ID", error: error.message });
        }
    }

    static async GetForPersonaCurso(req, res) {
        const { id_persona, id_curso_matriculado } = req.params;
        try {
            const data = await AsistenciaService.GetForPersonaCurso(id_persona, id_curso_matriculado);
            res.status(200).json({ mensaje: 'Asistencias obtenidas correctamente', asistencias: data });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener asistencias por persona y curso matriculado', error: error.message });
        }
    }
}

module.exports = AsistenciaController;