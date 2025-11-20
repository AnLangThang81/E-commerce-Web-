const { Op } = require("sequelize");

const { sequelize, Brand } = require("../models");
const { AppError } = require("../middlewares/errorHandler");

// function normal name
function normallizeBrandsName(name) {
  if (!name) return "";

  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function checkBrandNameUnique(name, id = null) {
  const nameNormalized = name.trim();

  //check the name empty
  if (!nameNormalized) throw new Error("Tên không được để trống", 400);
  //check the  conditional name
  const idFilter = id ? { id: { [Op.ne]: id } } : {};

  // find brand in db
  const existing = await Brand.findOne({
    where: {
      [Op.and]: [
        sequelize.where(
          //convert value db to Lower
          sequelize.fn("LOWER", sequelize.col("name")),
          nameNormalized.toLowerCase()
        ),
        idFilter,
      ],
    },
  });
  if (existing) {
    throw new Error("Tên thương hiệu đã có trong danh sách", 400);
  }
  return normallizeBrandsName(name);
}
const createBrands = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      logo,
      address,
      isActive,
      metaTitle,
      metaDescription,
      sortOrder,
    } = req.body;

    // check the name normal and check exist name
    const finalName = await checkBrandNameUnique(name);
    const brand = await Brand.create({
      name: finalName,
      slug,
      description,
      logo,
      address,
      isActive,
      metaTitle,
      metaDescription,
      sortOrder,
    });
    res.status(201).json({
      status: "success",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

const UpdateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      logo,
      address,
      isActive,
      metaTitle,
      metaDescription,
      sortOrder,
    } = req.body;

    // find brands
    const brand = await Brand.findByPk(id);
    if (!brand) throw new AppError("Không tìm thấy thương hiệu", 404);

    // normal name and check exist
    let finalName = brand.name;
    if (name) {
      finalName = await checkBrandNameUnique(name, id);
    }
    //Update brands
    await brand.update({
      name: finalName,
      slug: slug !== undefined ? slug : brand.slug,
      description: description !== undefined ? description : brand.description,
      logo: logo !== undefined ? logo : brand.logo,
      address: address !== undefined ? address : brand.address,
      isActive: isActive !== undefined ? isActive : brand.isActive,
      metaTitle: metaTitle !== undefined ? metaTitle : brand.metaTitle,
      metaDescription:
        metaDescription !== undefined ? metaDescription : brand.metaDescription,
      sortOrder: sortOrder !== undefined ? sortOrder : brand.sortOrder,
    });
    res.status(200).json({
      status: "success",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// delete
const deleteBrands = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);
    if (!brand) throw new AppError("Không tìm thấy thương hiệu", 404);
    await brand.destroy();
    res.status(204).json({
      status: "success",
      message: "Đã xóa thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createBrands,
  UpdateBrand,
  deleteBrands,
};
