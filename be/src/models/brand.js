const { DataTypes, STRING } = require("sequelize");
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
      DataTypes: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    metaTitle: { type: DataTypes.STRING, allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "brands",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["name"] },
      { unique: true, fields: ["slug"] },
      { fields: ["isActive"] },
      { fields: ["sortOrder"] },
    ],
  }
);
module.exports = Brand;
