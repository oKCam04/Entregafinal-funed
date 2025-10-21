'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idCursoMatriculado: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cursoMatriculados', 
          key: 'id'
        }
      },
      fechaEmision: {
        type: Sequelize.DATE
      },
      urlCertificado: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('certificados');
  }
};

