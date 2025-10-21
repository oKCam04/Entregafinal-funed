'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class persona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      persona.hasMany(models.docente, {
        foreignKey: 'id_persona',
        as: 'docentes'
      });
      persona.hasMany(models.usuario, {
        foreignKey: 'id_persona', 
        as: 'usuarios' });
      persona.hasMany(models.cursomatriculado, {
        foreignKey: 'id_persona',
        as: 'cursosMatriculados'
      });
      persona.hasMany(models.pago, {
        foreignKey: 'id_persona',
        as: 'pagos'
      });
      persona.hasMany(models.asistencia, {
        foreignKey: 'id_persona',
        as: 'asistencias'
      });
    }
  }
  persona.init({
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    numero_identificacion: DataTypes.STRING,
    tipo_identificacion: DataTypes.ENUM('CC','TI','CE','PAS'),
    fecha_nacimiento: DataTypes.DATE,
    telefono: DataTypes.STRING,
    correo: DataTypes.STRING,
    rol:{ type: DataTypes.ENUM('Administrador', 'Usuario','Estudiante','Docente'), defaultValue:'Usuario'}
  }, {
    sequelize,
    modelName: 'persona',
    tableName: 'personas',
    timestamps: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at'
    
  });
  return persona;
};