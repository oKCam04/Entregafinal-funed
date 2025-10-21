'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asistencia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idCursosMatriculados: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cursoMatriculados', 
          key: 'id'
        }
      },
      asistio: {
        type: Sequelize.ENUM('Si', 'No')
      },
      fecha: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('asistencia');
  }
};

