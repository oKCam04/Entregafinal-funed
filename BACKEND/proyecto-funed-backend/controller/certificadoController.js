const CertificadoService = require('../services/certificadoService');

class CertificadoController {
    static async GetAll(req, res) {
        try {
            const data = await CertificadoService.GetAll();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al listar certificados", error: error.message });
        }
    }

    static async Create(req, res) {
        const { idCursoMatriculado, fechaEmision, urlCertificado } = req.body;
        try {
            const data = await CertificadoService.Create(idCursoMatriculado, fechaEmision, urlCertificado);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al crear certificado", error: error.message });
        }
    }

    static async Update(req, res) {
        const { id } = req.params;
        const { id_curso_matriculado, fecha_emision, url_certificado } = req.body;
        try {
            const data = await CertificadoService.Update(id, id_curso_matriculado, fecha_emision, url_certificado);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar certificado", error: error.message });
        }
    }

    static async Delete(req, res) {
        const { id } = req.params;
        try {
            await CertificadoService.Delete(id);
            res.json({ mensaje: "Certificado eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar certificado", error: error.message });
        }
    }

    static async GetForId(req, res) {
        const { id } = req.params;
        try {
            const data = await CertificadoService.GetForId(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al buscar certificado", error: error.message });
        }
    }
}

module.exports = CertificadoController;
