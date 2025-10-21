'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class oferta_curso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      oferta_curso.belongsTo(models.curso, {
        foreignKey: 'id_curso',
        as: 'curso'
      })
      oferta_curso.hasMany(models.contenidoapoyo, {
        foreignKey: 'id_oferta_curso',
        as: 'contenidosApoyo'
      });
    }
  }
  oferta_curso.init({
    codigo_curso: DataTypes.INTEGER,
    id_curso: DataTypes.INTEGER,
    fecha_inicio_curso: DataTypes.DATE,
    fecha_fin_curso: DataTypes.DATE,
    horario: DataTypes.STRING,
    cupos: DataTypes.INTEGER,
    precio: DataTypes.DECIMAL(10, 2),
    foto: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ofertacurso',
    timestamps: false
  });
  return oferta_curso;
};