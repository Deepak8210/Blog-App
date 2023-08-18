const User = require("../../model/user/User");
const bcrypt = require("bcrypt");
const appErr = require("../../utils/appErr");

//register
const registerController = async (req, res, next) => {
  const { fullname, email, password, role, bio } = req.body;

  // check if fields are empty
  if (!fullname || !email || !password) {
    return res.render("users/register", {
      error: "All fields are required",
    });
  }
  try {
    //check if user exist
    const userFound = await User.findOne({ email });
    //if found error
    if (userFound) {
      return res.render("users/register", {
        error: "User already exist",
      });
    }
    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(password, salt);
    //register the user
    const user = await User.create({
      fullname,
      email,
      password: securePassword,
      role,
      bio,
    });
    res.redirect("/api/v1/users/login");
  } catch (error) {
    res.render("users/register", {
      error: error.message,
    });
  }
};

//login
const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("users/login", {
      error: "Email and Password required",
    });
  }
  try {
    //check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.render("users/login", {
        error: "Invalid login credentials",
      });
    }
    //verify password
    const verifiedPassword = await bcrypt.compare(password, userFound.password);
    if (!verifiedPassword) {
      return res.render("users/login", {
        error: "Invalid login credentials",
      });
    }

    //save the login in session for authorization
    req.session.userAuth = userFound._id;
    console.log(req.session);

    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.render("users/login", {
      error: error.message,
    });
  }
};

//details public details
const userDetailsController = async (req, res) => {
  try {
    //get id
    const userId = req.params.id;
    //get user
    const user = await User.findById(userId);
    res.render("users/updateUser", { user, error: "" });
  } catch (error) {
    res.render("users/updateUser", {
      error: error.message,
    });
  }
};

//profile
const profileController = async (req, res) => {
  try {
    // get the user
    const userId = req.session.userAuth;
    // find the user with above id from auth
    const user = await User.findById(userId)
      .populate("posts")
      .populate("comments");
    res.render("users/profile", { user });
  } catch (error) {
    res.json(error);
  }
};

//upload profile photo
const profilePicContorller = async (req, res) => {
  try {
    //if user is providing a file or not
    if (!req.file) {
      return res.render("users/profileImgUpload", {
        error: "Please choose a photo",
      });
    }
    // find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.render("users/profileImgUpload", {
        error: "User not found",
      });
    }
    //update profile pic
    await User.findByIdAndUpdate(
      userId,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/profileImgUpload", {
      error: error.message,
    });
  }
};

//cover photo upload
const coverPicController = async (req, res) => {
  try {
    //if user is providing a file or not
    if (!req.file) {
      return res.render("users/coverImgUpload", {
        error: "Please choose a photo",
      });
    }
    // find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.render("users/coverImgUpload", {
        error: "User not found",
      });
    }
    //update cover pic
    await User.findByIdAndUpdate(
      userId,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/coverImgUpload", {
      error: error.message,
    });
  }
};

//password update
const updatePasswordController = async (req, res, next) => {
  const { password } = req.body;
  try {
    //if not providing any password
    if (!password) {
      return res.render("users/updatePassword", {
        error: "Please provide the password",
      });
    }
    //check if user updating the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(password, salt);

      //update user password
      await User.findByIdAndUpdate(
        req.session.userAuth,
        { password: securePassword },
        { new: true }
      );
      res.redirect("/api/v1/users/profile-page");
    }
  } catch (error) {
    return res.render("users/updatePassword", {
      error: error.message,
    });
  }
};

//update user
// const updateUserController = async (req, res, next) => {
//   const { fullname, email } = req.body;
//   try {
//     //if no email or fullname
//     if (!fullname && !email) {
//       return res.render("users/updateUser", {
//         error: "Please provide details to update",
//         user: "",
//       });
//     }

//     //if the email is taken or not
//     if (email) {
//       const emailUsed = await User.findOne({ email });
//       if (emailUsed) {
//         return res.render("users/updateUser", {
//           error: "Email already taken",
//           user: "",
//         });
//       }
//     }

//     //update the user details
//     await User.findByIdAndUpdate(
//       req.session.userAuth,
//       {
//         fullname,
//         email,
//       },
//       {
//         new: true,
//       }
//     );
const updateUserController = async (req, res, next) => {
  const { fullname, email } = req.body;
  try {
    // Retrieve the existing user details
    const existingUser = await User.findById(req.session.userAuth);

    // Check if the email is taken
    if (email && email !== existingUser.email) {
      const emailUsed = await User.findOne({ email });
      if (emailUsed) {
        return res.render("users/updateUser", {
          error: "Email already taken",
          user: "",
        });
      }
    }

    // Check if both fullname and email are empty
    if (!fullname && !email) {
      return res.render("users/updateUser", {
        error: "Please provide details to update",
        user: existingUser,
      });
    }

    // Update the user details
    if (fullname) {
      existingUser.fullname = fullname;
    }

    if (email) {
      existingUser.email = email;
    }

    // Save the updated user details
    await existingUser.save();
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/updateUser", {
      error: error.message,
      user: "",
    });
  }
};

//logout
const logoutController = async (req, res) => {
  //destroy the session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};

module.exports = {
  registerController,
  loginController,
  userDetailsController,
  profileController,
  profilePicContorller,
  coverPicController,
  updatePasswordController,
  updateUserController,
  logoutController,
};
