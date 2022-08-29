const Cart = require("../models/cart");

const User = require("../models/user");

const Product = require("../models/product");

exports.addToCart = async (req, res, next) => {
  //const cartData = req.body.cart;
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  //const price = req.body.price;
  const user = await User.findById(req.userId);
  try {
    let product = await Product.findById(productId);
    // check if product exists
    if (!product) {
      const error = new Error("Product doesn't exist");
      error.statusCode = 500;
      next(error);
    }
    let cart = await Cart.findOne(user);
    if (cart) {
      //that cart exists for that user
      let itemIndex = cart.products.findIndex((p) => p.productId == productId);
      // for upading existing product
      if (itemIndex > -1) {
        let productItem = cart.products[itemIndex];
        productItem.quantity = quantity;
        productItem.price = product.price;
        cart.products[itemIndex] = productItem;
      } else {
        //if added product doesn't exit, adding that product
        cart.products.push(productId, quantity, product.price);
      }
      // update total sum
      cart.totalQty = cart.products.reduce((sum, item) => {
        return sum + item.quantity;
      }, 0);
      //saving the cart
      cart = await cart.save();
      return res.status(201).json({ message: "Cart created successfully" });
    } else {
      //if no cart, create a new one
      const newCart = await Cart.create({
        userId: user._id,
        products: [{ productId, quantity, price: product.price }],
      });
      //saving new cart
      return res
        .status(201)
        .json({ message: "New cart created successfully", data: newCart });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
