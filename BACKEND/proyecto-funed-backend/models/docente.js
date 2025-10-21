'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class docente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      docente.belongsTo(models.persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
      docente.hasMany(models.modulodocente, {
        foreignKey: 'id_docente',
        as: 'modulosDocentes'
      });
    }
  }
  docente.init({
    id_persona: DataTypes.INTEGER,
    especialidad: DataTypes.STRING,
    fecha_contratacion: DataTypes.DATE,
    fecha_terminacion: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'docente',
    timestamps: false
  });
  return docente;
};