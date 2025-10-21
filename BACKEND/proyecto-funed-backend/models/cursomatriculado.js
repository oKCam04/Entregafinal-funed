'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cursomatriculado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      cursomatriculado.belongsTo(models.ofertacurso, {
        foreignKey: 'id_curso_oferta',
        as: 'curso'
      });
      cursomatriculado.belongsTo(models.persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
      cursomatriculado.hasMany(models.pago, {
        foreignKey: 'id_curso_matriculado',
        as: 'pagos'
      })
      cursomatriculado.hasMany(models.asistencia, {
        foreignKey: 'id_curso_matriculado',
        as: 'asistencias'
      });
      cursomatriculado.hasMany(models.certificado, {
        foreignKey: 'id_curso_matriculado',
        as: 'certificados'
      });
    }
  }
  cursomatriculado.init({
    id_curso_oferta: DataTypes.INTEGER,
    id_persona: DataTypes.INTEGER,
    estado: DataTypes.ENUM('Preinscrito', 'Activo', 'Finalizado', 'Cancelado'),
    resultado: DataTypes.ENUM('Aprobado', 'Reprobado', 'Pendiente')
  }, {
    sequelize,
    modelName: 'cursomatriculado',
    tableName: "cursomatriculado",
    timestamps: false
  });
  return cursomatriculado;
};