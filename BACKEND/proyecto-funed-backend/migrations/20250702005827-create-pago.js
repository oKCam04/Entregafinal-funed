'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagos', {
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
        }
      },
      idCursosMatriculados: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cursoMatriculados', 
          key: 'id'
        }
      },
      formaPago: {
        type: Sequelize.ENUM('Efectivo', 'Tarjeta de Crédito', 'Transferencia Bancaria', 'Pago en Línea')
      },
      monto: {
        type: Sequelize.INTEGER
      },
      estado: {
        type: Sequelize.ENUM('Pendiente', 'Completado', 'Fallido')
      },
      fechaPago: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pagos');
  }
};