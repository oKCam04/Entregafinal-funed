const { documento } = require('../models');

class DocumentoService {
    static async getAll() {
        try {
            return await documento.findAll();
        } catch (error) {
            console.log("Error en servicio al listar documentos:", error.message);
            throw error;
        }
    }

    static async create(data) {
        try {
            const existing = await documento.findOne({ where: { id_persona: data.id_persona } });
            if (existing) {
                throw new Error('Esta persona ya tiene documentos registrados.');
            }
            return await documento.create(data);
        } catch (error) {
            console.log("Error en servicio al crear documento:", error.message);
            throw error;
        }
    }

    static async update(id, cambios) {
        try {
            const datos = await documento.findByPk(id);
            if (!datos) {
                throw new Error(`Documento con id=${id} no encontrado`);
            }
            return await datos.update(cambios);
        } catch (error) {
            console.log("Error en servicio al actualizar documento:", error.message);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const datos = await documento.findByPk(id);
            if (!datos) {
                throw new Error(`Documento con id=${id} no encontrado`);
            }
            return await datos.destroy();
        } catch (error) {
            console.log("Error en servicio al eliminar documento:", error.message);
            throw error;
        }
    }

    static async getForId(id) {
        try {
            const datos = await documento.findByPk(id);
            if (!datos) {
                throw new Error(`Documento con id=${id} no encontrado`);
            }
            return datos;
        } catch (error) {
            console.log("Error en servicio al buscar documento por ID:", error.message);
            throw error;
        }
    }
}; 

module.exports = DocumentoService;
