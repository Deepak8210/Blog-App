const express = require("express");
const postRoutes = express.Router();
const multer = require("multer");
const Post = require("../../model/post/Post");
const storage = require("../../config/cloudinary");
const {
  createPostController,
  fetchPostsController,
  fetchPostController,
  updatePostController,
  deletePostController,
} = require("../../controllers/posts/posts");

const isLoggedIn = require("../../middlewares/isLoggedIn");

//instance of multer
const upload = multer({
  storage,
});

//frontend//
//GET api/v1/posts --------fetch posts
postRoutes.get("/get-post-form", (req, res) => {
  res.render("posts/createPost", { error: "" });
});

//updateForm page route
postRoutes.get("/post-update/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    res.render("posts/updatePost", {
      error: "",
      post,
    });
  } catch (error) {
    res.render("/posts/updatePost", {
      error: error.message,
      post: "",
    });
  }
});

//backend//
//POST api/v1/posts --------create posts
postRoutes.post("/", isLoggedIn, upload.single("file"), createPostController);

//GET api/v1/posts --------fetch posts
postRoutes.get("/", fetchPostsController);

//GET api/v1/posts/:id --------fetch post details
postRoutes.get("/:id", fetchPostController);

//PUT api/v1/posts/:id --------update posts details
postRoutes.put("/:id", isLoggedIn, upload.single("file"), updatePostController);

//DELETE api/v1/posts/:id --------delete post
postRoutes.delete("/:id", isLoggedIn, deletePostController);

module.exports = postRoutes;
