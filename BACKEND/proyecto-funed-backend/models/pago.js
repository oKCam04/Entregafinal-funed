'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pago extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pago.belongsTo(models.persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
      pago.belongsTo(models.cursomatriculado, {
        foreignKey: 'id_curso_matriculado',
        as: 'cursoMatriculado'
      });
    }
  }
  pago.init({
    id_persona: DataTypes.INTEGER,
    id_curso_matriculado: DataTypes.INTEGER,
    forma_pago: DataTypes.STRING,
    monto: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    fecha_pago: DataTypes.DATE,
    comprobante: DataTypes.STRING,
    referencia: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pago',
    timestamps: false
  });
  return pago;
};

