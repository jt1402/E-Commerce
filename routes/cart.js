const express = require("express");

const Cart = require("../models/cart");

const cartRoute = require("../controllers/cart");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

//GET cart
router.post("/addToCart", isAuth, cartRoute.addToCart);
//POST cart
// router.post("/addToCart", cartRoute.getCart);

module.exports = router;
