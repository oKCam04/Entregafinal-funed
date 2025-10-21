const PagoService = require('../services/pagoService');

class PagoController {
    static async GetAll(req, res) {
        try {
            const data = await PagoService.GetAll();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al listar", error: error.message });
        }
    }

    static async Create(req, res) {
        try {
            const data = await PagoService.Create(req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al crear", error: error.message });
        }
    }

    static async Update(req, res) {
        const { id } = req.params; // este es el id del pago
        try {
            const data = await PagoService.Update(id, req.body);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar", error: error.message });
        }
    }

    static async Delete(req, res) {
        const { id } = req.params;
        try {
            await PagoService.Delete(id);
            res.json({ mensaje: "Eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar", error: error.message });
        }
    }

    static async GetForId(req, res) {
        const { id } = req.params;
        try {
            const data = await PagoService.GetForId(id);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error al buscar pago", error: error.message });
        }
    }
}

module.exports = PagoController;
