const {persona}=require('../models');

class PersonasService {
    static async listarPersonas() {
        try {
            const personasList = await persona.findAll();
            return personasList;
        } catch (error) {
            console.log("Error en servicio")
            
        }
    }
    static async crearPersona(nombre, apellido, numero_identificacion, tipo_identificacion, fecha_nacimiento, telefono, correo, rol) {
        try{
            return await persona.create({nombre, apellido, numero_identificacion , tipo_identificacion, fecha_nacimiento, telefono, correo, rol})
        }
        catch (error){
            console.log(error);
            console.log("Error en servicio al crear persona")
            
        }
        }
    static async actualizarPersona(id, nombre, apellido, numero_identificacion, tipo, fecha, telefono, correo, rol) {
        try {
            const personas = await persona.findByPk(id);
            if (!personas) {
                throw new Error('Persona no encontrada');
            }
            return await personas.update({ nombre, apellido, numero_identificacion, tipo, fecha, telefono, correo, rol });
        } catch (error) {
            console.log("Error en servicio al actualizar persona")
            console.log(error);
        }
    }
    static async eliminarPersona(id) {
        try {
            const persona = await persona.findByPk(id);
            if (!persona) {
                
                throw new Error('Persona no encontrada');
            }
            return await persona.destroy();
        } catch (error) {
            console.log("Error en servicio al eliminar persona")
        }
    }
    static async buscarPersonaPorId(id) {
        try {
            const personaEncontrada = await persona.findByPk(id);
            if (!personaEncontrada) {
                throw new Error('Persona no encontrada');
            }
            return personaEncontrada;
        } catch (error) {
            console.log("Error en servicio al buscar persona por ID");
            console.log(error);
        }
    }

    
}

module.exports = PersonasService;