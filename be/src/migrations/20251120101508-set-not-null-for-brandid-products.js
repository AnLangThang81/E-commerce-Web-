"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("products", "brand_id", {
      type: Sequelize.UUID,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("products", "brand_id", {
      type: Sequelize.UUID,
      allowNull: true
    });
  },
};
