'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('docentes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPersona: {
        type: Sequelize.INTEGER,
        references: {
          model: 'personas',
          key: 'id'
        },
      },
      especialidad: {
        type: Sequelize.STRING
      },
      fechaContratacion: {
        type: Sequelize.DATE
      },
      fechaTerminacion: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('docentes');
  }
};