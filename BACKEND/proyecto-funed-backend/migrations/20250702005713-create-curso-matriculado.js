'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cursoMatriculados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idCursoOferta: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ofertaCursos', 
          key: 'id'
        }
      },
      idPersona: {
        type: Sequelize.INTEGER,
        references: {
          model: 'personas', 
          key: 'id'
        }
      },
      estado:{
        type:Sequelize.ENUM('PreInscrito','Matriculado','Cancelado','Finalizado'),defaultValue:'PreInscrito',
      },
      resultado:{
        type:Sequelize.ENUM('Aprobado','Reprobado','Pendiente'),defaultValue:'Pendiente',
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cursoMatriculados');
  }
};