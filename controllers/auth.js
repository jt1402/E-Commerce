const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation failed");
    error.statusCode = 422;
    next(error);
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const salt = await bcrypt.genSalt(12);
  bcrypt
    .hash(password, salt)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPw,
      });
      if (errors.isEmpty()) {
        return user.save();
      }
    })
    .then((result) => {
      return res
        .status(200)
        .json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this E-mail couldn't be found");
        error.statusCode = 401;
        next(error);
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEquel) => {
      if (!isEquel) {
        const error = new Error("Wrong Password");
        error.statusCode = 402;
        next(error);
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "herethesecretgoes",
        { expiresIn: "30d" }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
