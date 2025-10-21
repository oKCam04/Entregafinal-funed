'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contenidoapoyo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asociación con oferta de curso
      contenidoapoyo.belongsTo(models.ofertacurso, {
        foreignKey: 'id_oferta_curso',
        as: 'oferta'
      });
    }
  }
  contenidoapoyo.init({
    id_oferta_curso: DataTypes.INTEGER,
    titulo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    url_contenido: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'contenidoapoyo',
    tableName: 'contenidoapoyo',
    timestamps: false
  });
  return contenidoapoyo;
};