'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ofertaCursos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigoCurso: {
        type: Sequelize.INTEGER
      },
      idCurso: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cursos', 
          key: 'id'
        }
      },
      fechaInicioCurso: {
        type: Sequelize.DATE
      },
      fechaFinCurso: {
        type: Sequelize.DATE
      },
      horario: {
        type: Sequelize.STRING
      },
      cupos: {
        type: Sequelize.INTEGER
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2)
      },
      foto:{
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ofertaCursos');
  }
};