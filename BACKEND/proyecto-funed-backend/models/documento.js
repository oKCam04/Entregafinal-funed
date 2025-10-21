'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documento extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Documento.init({
    id_persona: DataTypes.INTEGER,
    documento_identidad: DataTypes.STRING,
    foto_3x4: DataTypes.STRING,
    recibo_publico: DataTypes.STRING,
    acta_grado: DataTypes.STRING,
    eps_salud: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'documento',
    timestamps: false

  });
  return Documento;
};