'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class asistencia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      asistencia.belongsTo(models.cursomatriculado, {
        foreignKey: 'id_curso_matriculado',
        as: 'cursoMatriculado'
      });
      asistencia.belongsTo(models.persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
    }
  }
  asistencia.init({
    id_curso_matriculado: DataTypes.INTEGER,
    id_persona: DataTypes.INTEGER,
    asistio: DataTypes.ENUM('Si', 'No'),
    fecha: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'asistencia',
    timestamps: false
  });
  return asistencia;
};

