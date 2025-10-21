const PersonasService = require("../services/personasService");
const UsuarioService = require("../services/usuarioServices");
const EmailService = require("../services/emailService");
const MatricularCursoService = require("../services/cursoMatriculadoService");

class PersonasController {
    static async listarPersonas(req, res) {
        try {
            const personasLista = await PersonasService.listarPersonas();
            res.json(personasLista);
        } catch (error) {
            res.json({ message: "Error al listar personas" });
        }
    }

    // Listar personas matriculadas activas por oferta de curso
    static async listarPersonasActivasPorOferta(req, res) {
        const { id_oferta_curso } = req.params;
        try {
            const personas = await MatricularCursoService.listarPersonasActivasPorOferta(Number(id_oferta_curso));
            res.status(200).json({ mensaje: "Personas activas listadas correctamente", personas });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al listar personas activas por oferta", error: error.message });
        }
    }

    static async crearPersona(req, res) {
        const { nombre, apellido, numero_identificacion, tipo_identificacion, fecha_nacimiento, telefono, correo, rol } = req.body;
        try {
            const nuevaPersona = await PersonasService.crearPersona(
                nombre,
                apellido,
                numero_identificacion,
                tipo_identificacion,
                fecha_nacimiento,
                telefono,
                correo,
                rol
            );

            // Flujo desacoplado: creación de usuario y envío de correo se realizan desde el frontend
            // vía /auth/register y /api/email/send-welcome respectivamente.
            res.json(nuevaPersona);
        } catch (error) {
            res.json({ message: "Error al crear persona" });
        }
    }

    static async actualizarPersona(req, res) {
        const { id } = req.params;
        const { nombre, apellido, numero_identificacion, tipo, fecha, telefono, correo, rol } = req.body;
        try {
            const personaActualizada = await PersonasService.actualizarPersona(id, nombre, apellido, numero_identificacion, tipo, fecha, telefono, correo, rol);
            res.json(req.body);
        } catch (error) {
            res.json({ message: "Error al actualizar persona" });
        }
    }

    static async eliminarPersona(req, res) {
        const { id } = req.params;
        try {
            await PersonasService.eliminarPersona(id);
            res.json({mensaje:"Usuario eliminado exitosamente"})
        } catch (error) {
            res.json({ message: "Error al eliminar persona" });
        }
    }

    static async buscarPersonaPorId(req, res) {
        const { id } = req.params;
        try {
            const persona = await PersonasService.buscarPersonaPorId(id);
            res.json(persona);
        } catch (error) {
            res.json({ message: "Error al buscar persona por ID" });
        }
    }

    // Reenvía el correo de bienvenida con credenciales
    static async enviarCorreoBienvenida(req, res) {
        const { id } = req.params;
        try {
            const persona = await PersonasService.buscarPersonaPorId(id);
            if (!persona) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }

            const result = await EmailService.sendWelcomeOnRegistration({
                to: persona.correo,
                nombre: persona.nombre,
                email: persona.correo,
                numero_identificacion: persona.numero_identificacion,
            });

            if (result.sent) {
                return res.json({ message: 'Correo de bienvenida enviado', messageId: result.messageId });
            }
            return res.status(500).json({ message: 'No se pudo enviar el correo', reason: result.reason });
        } catch (error) {
            res.status(500).json({ message: 'Error al enviar correo de bienvenida', error: error.message });
        }
    }
}
module.exports = PersonasController;