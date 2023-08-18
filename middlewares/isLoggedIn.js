const appErr = require("../utils/appErr");

const isLoggedIn = (req, res, next) => {
  // check if user is logged in
  if (req.session.userAuth) {
    return next();
  } else {
    return res.render("users/unauthorized");
  }
};

module.exports = isLoggedIn;
