'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class modulo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
  
      modulo.hasMany(models.modulodocente, {
        foreignKey: 'id_modulo',
        as: 'modulosDocente'
      });
    }
  }
  modulo.init({
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'modulo',
    timestamps: false
  });
  return modulo;
};