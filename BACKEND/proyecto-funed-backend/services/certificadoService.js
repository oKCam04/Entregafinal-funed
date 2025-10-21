const { certificado } = require('../models');

class CertificadoService {
    static async GetAll() {
        try {
            return await certificado.findAll();
        } catch (error) {
            console.log("Error en servicio al listar certificados:", error.message);
            throw error;
        }
    }

    static async Create(idCursoMatriculado, fechaEmision, urlCertificado) {
        try {
            return await certificado.create({ idCursoMatriculado, fechaEmision, urlCertificado });
        } catch (error) {
            console.log("Error en servicio al crear certificado:", error.message);
            throw error;
        }
    }

    static async Update(id, id_curso_matriculado, fecha_emision, url_certificado) {
        try {
            const cert = await certificado.findByPk(id);
            if (!cert) {
                throw new Error(`Certificado con id=${id} no encontrado`);
            }
            return await cert.update({ id_curso_matriculado, fecha_emision, url_certificado });
        } catch (error) {
            console.log("Error en servicio al actualizar certificado:", error.message);
            throw error;
        }
    }

    static async Delete(id) {
        try {
            const cert = await certificado.findByPk(id);
            if (!cert) {
                throw new Error(`Certificado con id=${id} no encontrado`);
            }
            return await cert.destroy();
        } catch (error) {
            console.log("Error en servicio al eliminar certificado:", error.message);
            throw error;
        }
    }

    static async GetForId(id) {
        try {
            const cert = await certificado.findByPk(id);
            if (!cert) {
                throw new Error(`Certificado con id=${id} no encontrado`);
            }
            return cert;
        } catch (error) {
            console.log("Error en servicio al buscar certificado por ID:", error.message);
            throw error;
        }
    }
}

module.exports = CertificadoService;
