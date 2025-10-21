const UserService=require("../services/usuarioServices");

class UsuarioController {
    static async register(req, res){
        try{
            const {id_persona, email, password} = req.body;
            await UserService.register(id_persona, email, password);
            res.json("Usuario registrado correctamente");
        }catch(error){
            res.status(500).json({error: error.message});
        }
    }

    static async login(req, res){
        try{
            const {email, password} = req.body;
            const resultado= await UserService.login(email, password);
            res.json(resultado);

        }catch(error){
            res.status(401).json({error: error.message}); 
        }
    }
    static async getAll(req, res){
        try{
            const usuarios= await UserService.getAll();
            res.json(usuarios);
        }catch(error){
            res.status(500).json({error: error.message});
        }
    }

    static async actualizarUsuario(req, res){
        const {id}= req.params;
        const {id_persona, email, password}=req.body;
        try{
            const cursoActualizado= await UserService.update(id, id_persona, email, password);
            res.json(cursoActualizado)
        }catch(error){
            console.log(error)
            res.status(500).json({message:"Error al actualizar user"})
        }
    }
}

module.exports = UsuarioController;