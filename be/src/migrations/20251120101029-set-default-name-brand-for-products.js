"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE "products"
      SET "brand_id" = '00000000-0000-0000-0000-000000000001'
      WHERE "brand_id" IS NULL
      `);
  },

  async down(queryInterface, Sequelize) {
    
      await queryInterface.sequelize.query(`
        UPDATE "products"
      SET "brand_id" = NULL
      WHERE "brand_id"= '00000000-0000-0000-0000-000000000001'
      `);
     
  },
};
