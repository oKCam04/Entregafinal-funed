'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class curso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      curso.hasMany(models.ofertacurso, {
        foreignKey: 'id_curso',
        as: 'ofertasCursos'
      });
    
    }
  }
  curso.init({
    nombre_curso: DataTypes.STRING,
    duracion: DataTypes.INTEGER,
    temario: DataTypes.TEXT,
    tipo_curso: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'curso',
    timestamps: false
  });
  return curso;
};