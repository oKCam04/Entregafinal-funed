const DocumentoService = require('../services/documentoService');

class DocumentoController {
    static async GetAll(req, res) {
        try {
            const data = await DocumentoService.getAll();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al listar", error: error.message });
        }
    }

    static async Create(req, res) {
        try {
            const data = await DocumentoService.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            if (error.message === 'Esta persona ya tiene documentos registrados.') {
                return res.status(409).json({ message: 'Error al crear: Ya agregaste datos para esta persona.' });
            }
            res.status(500).json({ message: "Error al crear", error: error.message });
        }
    }

    static async Update(req, res) {
        const { id } = req.params;
        try {
            const data = await DocumentoService.update(id, req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar", error: error.message });
        }
    }

    static async Delete(req, res) {
        const { id } = req.params;
        try {
            await DocumentoService.delete(id);
            res.json({ mensaje: "Eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar", error: error.message });
        }
    }

    static async GetForId(req, res) {
        const { id } = req.params;
        try {
            const data = await DocumentoService.getForId(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al buscar documento", error: error.message });
        }
    }
}

module.exports = DocumentoController;
