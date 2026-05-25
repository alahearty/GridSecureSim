'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryInterface.createTable('Alerts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      alertId: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      severity: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      transactionHash: { type: Sequelize.STRING, allowNull: true },
      blockNumber: { type: Sequelize.INTEGER, allowNull: true },
      timestamp: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'mitigated', 'resolved'),
        defaultValue: 'active',
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('Trades', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      buyer: { type: Sequelize.STRING, allowNull: false },
      seller: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.DECIMAL(20, 8), allowNull: false },
      price: { type: Sequelize.DECIMAL(20, 8), allowNull: false },
      transactionHash: { type: Sequelize.STRING, allowNull: false },
      blockNumber: { type: Sequelize.INTEGER, allowNull: false },
      timestamp: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('CircuitBreakerEvents', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      newState: { type: Sequelize.STRING, allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: false },
      triggeredBy: { type: Sequelize.STRING, allowNull: false },
      timestamp: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    // Indexes
    await queryInterface.addIndex('Alerts', ['timestamp'], { name: 'idx_alerts_timestamp' });
    await queryInterface.addIndex('Alerts', ['severity'], { name: 'idx_alerts_severity' });
    await queryInterface.addIndex('Alerts', ['status'], { name: 'idx_alerts_status' });
    await queryInterface.addIndex('Trades', ['timestamp'], { name: 'idx_trades_timestamp' });
    await queryInterface.addIndex('Trades', ['buyer'], { name: 'idx_trades_buyer' });
    await queryInterface.addIndex('Trades', ['seller'], { name: 'idx_trades_seller' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CircuitBreakerEvents');
    await queryInterface.dropTable('Trades');
    await queryInterface.dropTable('Alerts');
  },
};
