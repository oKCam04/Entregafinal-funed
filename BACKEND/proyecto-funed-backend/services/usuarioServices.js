const {usuario}=require('../models');
const {persona}=require('../models');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require("dotenv").config();

class UsuarioService{

    static async register(id_persona, email, password){
        const hashed= await bcrypt.hash(password,10);
        return usuario.create({id_persona, email, password: hashed})  
    }

    static async login( email, password){
        const user=await usuario.findOne({where:{email}, include: [{model: persona, as:"persona", attributes: ['nombre', 'rol']}]});
        if(!user || !(await bcrypt.compare(password, user.password))){
            throw new Error('Invalid email or password');
        }   
        const token=jwt.sign({id:user.id, email: user.nombreUsuario}, process.env.JWT_SECRET, {expiresIn:'3h'});
        return {token: token, user:user}
    }

    static async getAll(){
        return usuario.findAll({
            include: [{model: persona, as:"persona", attributes: ['nombre', 'rol']}]
        });
    }

    static async update(id, id_persona, email, password){
        try{
            const hashed= await bcrypt.hash(password,10);
            const user= await usuario.findByPk(id);
            if(!user) throw new Error("usuario no encontrado");
            return await user.update({id_persona, email, password:hashed})
        }catch(error){
            throw new Error("Error al actualizar usuario"+error.message)
        }
    }

}

module.exports = UsuarioService;