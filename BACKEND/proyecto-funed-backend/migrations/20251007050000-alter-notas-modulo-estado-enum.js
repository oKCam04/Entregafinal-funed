'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notas_modulos', 'estado', {
      type: Sequelize.ENUM('Aprobó', 'Pendiente', 'Desaprobó'),
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notas_modulos', 'estado', {
      type: Sequelize.STRING,
      allowNull: true
    });
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notas_modulos_estado";');
    }
  }
};