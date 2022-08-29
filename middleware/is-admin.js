const User = require("../models/user");

module.exports = async (req, res, next) => {
  const user = await  User.findById(req.userId);
  if (user.role === "admin") {
    next();
  }
  else{
    console.log(user);
    const error = new Error("Not able to Enter");
    error.statusCode = 401;
    next(error)
  }
  
};
