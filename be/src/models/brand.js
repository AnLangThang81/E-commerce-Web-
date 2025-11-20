const { DataTypes } = require("sequelize");
const slugify = require("slugify");
const sequelize = require("../config/sequelize");

const Brand = sequelize.define( 
  "Brand",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    metaTitle: { type: DataTypes.STRING, allowNull: true, field: 'meta_title' },
    metaDescription: { type: DataTypes.TEXT, allowNull: true, field: 'meta_description' },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
  },

  {
    tableName: "brands",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["name"] },
      { unique: true, fields: ["slug"] },
    ],
  }
);
module.exports = Brand;
