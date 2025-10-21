'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class certificado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      certificado.belongsTo(models.cursomatriculado, {
        foreignKey: 'id_curso_matriculado',
        as: 'matricula'
      });
    }
  }
  certificado.init({
    id_curso_matriculado: DataTypes.INTEGER,
    fecha_emision: DataTypes.DATE,
    url_certificado: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'certificado',
    timestamps: false
  });
  return certificado;
};