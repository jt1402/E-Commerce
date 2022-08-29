const path = require("path");

const { validationResult } = require("express-validator");

const Product = require("../models/product");

const User = require("../models/user");

exports.createProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  let creator;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    creator: req.userId,
  });
  product
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.product.push(product);
      return user.save();
    })
    .then((result) => {
      return res.status(200).json({
        message: "Product created successfully!",
        product: product,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("No product found");
        error.statusCode = 404;
        throw error;
      }
      return res
        .status(200)
        .json({ message: "Product is Fetched", product: product });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 404;
        throw err;
      }
      next();
    });
};

exports.editProduct = (req, res, next) => {
  const productId = req.params.productId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("Could not find product.");
        error.statusCode = 404;
        throw error;
      }
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save();
    })
    .then((result) => {
      return res
        .status(200)
        .json({ message: "product updated!", product: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("Could not find the product");
        error.status = 404;
        throw error;
      }
      Product.findOneAndRemove(product).then((result) => {
        Product.save();
      });
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.product.pull(productId);
      return user.save();
    })
    .then((result) => {
      return res.status(200).json({ message: "Product deleted successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
