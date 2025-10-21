'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notas_modulo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      notas_modulo.belongsTo(models.cursomatriculado, {
        foreignKey: 'id_curso_matriculado',
        as: 'matricula'
      });
      notas_modulo.belongsTo(models.modulo, {
        foreignKey: 'id_modulo',
        as: 'modulo'
      });
    }
  }
  notas_modulo.init({
    id_curso_matriculado: DataTypes.INTEGER,
    id_modulo: DataTypes.INTEGER,
    estado: DataTypes.ENUM('Aprobó', 'Pendiente', 'Desaprobó'),
    fecha_registro: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'notas_modulo',
    tableName: 'notas_modulo',
    timestamps: false
  });
  return notas_modulo;
};