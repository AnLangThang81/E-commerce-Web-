"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO "brands" (id, name, slug, description, "is_active", "sort_order", "created_at", "updated_at")
       VALUES ('00000000-0000-0000-0000-000000000001', 'Unknown', 'unknown', 'Default brand for existing products', true, 0, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;`);
  },

  async down(queryInterface, Sequelize) {
   
     await queryInterface.bulkDelete('brands', {slug: "'unknown"});
    
  },
};
