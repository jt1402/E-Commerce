const express = require("express");

const { body } = require("express-validator");

const Product = require("../models/product");

const router = express.Router();

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

//POST Product
router.post(
  "/create-product",
  isAuth,
  isAdmin,
  [
    body("title").isLength({ min: 5, max: 25 }).trim(),
    body("description").isString().isLength({ min: 10 }),
    body("price").isNumeric().trim(),
  ],

  adminController.createProduct
);

//get product
router.get("/product/:productId", isAuth, isAdmin, adminController.getProduct);

router.put(
  "/product/:productId",
  isAuth,
  isAdmin,
  [
    body("title").isLength({ min: 5, max: 25 }).trim(),
    body("description").isString().isLength({ min: 10 }),
    body("price").isNumeric().trim(),
  ],
  adminController.editProduct
);
//delete Product
router.delete(
  "/product/:productId",
  isAuth,
  isAdmin,
  adminController.deleteProduct
);

module.exports = router;
