const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const { validateRequest } = require("../middlewares/validateRequest");
const { brandSchema } = require("../validators/brand.validator");
const { authenticate } = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateRequest(brandSchema),
  brandController.createBrands
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateRequest(brandSchema),
  brandController.UpdateBrand
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  // validateRequest(brandSchema),
  brandController.deleteBrands
);

module.exports = router;
