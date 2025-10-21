'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class modulodocente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      modulodocente.belongsTo(models.docente, {
        foreignKey: 'id_docente',
        as: 'docente'
      });
      modulodocente.belongsTo(models.modulo, {
        foreignKey: 'id_modulo',
        as: 'modulo'
      });
    }
  }
  modulodocente.init({
    id_modulo: DataTypes.INTEGER,
    id_docente: DataTypes.INTEGER,
    id_oferta_curso: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'modulodocente',
    tableName: 'modulo_docente',
    freezeTableName: true,
    timestamps: false
  });
  return modulodocente;
};