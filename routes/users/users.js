const express = require("express");
const userRoutes = express.Router();
const {
  registerController,
  loginController,
  userDetailsController,
  profileController,
  profilePicContorller,
  coverPicController,
  updatePasswordController,
  updateUserController,
  logoutController,
} = require("../../controllers/users/users");
const isLoggedIn = require("../../middlewares/isLoggedIn");
const storage = require("../../config/cloudinary");
const multer = require("multer");

//instance of multer
const upload = multer({
  storage,
});

//------------frontend routes------------//
//login form
userRoutes.get("/login", (req, res) => {
  res.render("users/login", { error: "" });
});
//register form
userRoutes.get("/register", (req, res) => {
  res.render("users/register", { error: "" });
});
//update password
userRoutes.get("/update-password-page", (req, res) => {
  res.render("users/updatePassword", {
    error: "",
  });
});
//profile-pic-upload
userRoutes.get("/profile-pic-upload", (req, res) => {
  res.render("users/profileImgUpload", { error: "" });
});
//cover-pic-upload
userRoutes.get("/cover-pic-upload", (req, res) => {
  res.render("users/coverImgUpload", { error: "" });
});
//update user
// userRoutes.get("/update-user", (req, res) => {
//   res.render("users/updateUser");
// });

//backend routes

//POST api/v1/users/register
userRoutes.post("/register", registerController);

//POST api/v1/users/login
userRoutes.post("/login", loginController);

//GET api/v1/users/profile:id  ------------user can view only
userRoutes.get("/profile-page", isLoggedIn, profileController);

//PUT api/v1/users/profile-photo-upload/:id  --------profile pic upload
userRoutes.put(
  "/profile-photo-upload",
  isLoggedIn,
  upload.single("profile"),
  profilePicContorller
);

//PUT api/v1/users/cover-photo-upload/:id  --------cover photo upload
userRoutes.put(
  "/cover-photo-upload",
  isLoggedIn,
  upload.single("cover"),
  coverPicController
);

//PUT api/v1/users/update-password/:id  --------password update
userRoutes.put("/update-password", updatePasswordController);

//PUT api/v1/users/update/  --------user update
userRoutes.put("/update", updateUserController);

//GET api/v1/users/logout  -------- user logout
userRoutes.get("/logout", logoutController);

//GET api/v1/users/:id  --------public can view
userRoutes.get("/:id", userDetailsController);

module.exports = userRoutes;
