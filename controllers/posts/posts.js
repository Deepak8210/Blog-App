const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//create post
const createPostController = async (req, res, next) => {
  const { title, description, category, image, user } = req.body;
  try {
    //if no input
    if ((!title || !description || !category, !req.file)) {
      return res.render("posts/createPost", {
        error: "All fields are required",
      });
    }
    //find the id
    const userId = req.session.userAuth;
    //find the user
    const userFound = await User.findById(userId);
    // create post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: userFound._id,
      image: req.file.path,
    });

    // push the create post into array of user's post
    userFound.posts.unshift(postCreated._id);
    //save the user
    await userFound.save();

    res.redirect("users/profile-page");
  } catch (error) {
    return res.render("posts/createPost", {
      error: error.message,
    });
  }
};

//fetch all posts
const fetchPostsController = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comments").populate("user");
    res.render("posts/allPosts", { error: "", posts });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//fetch single post details
const fetchPostController = async (req, res, next) => {
  try {
    // get id from params
    const id = req.params.id;
    //find the post
    const post = await Post.findById(id)
      .populate({ path: "comments", populate: "user" })
      .populate("user");
    res.render("posts/postDetails", {
      error: "",
      post,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//update post
const updatePostController = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    // find the post
    const post = await Post.findById(req.params.id);

    //check if post not belongs to that user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("posts/updatePost", {
        error: "You are not authorized to update the Post",
        post: "",
      });
    }

    //if user is updating img or not
    if (req.file) {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
          image: req.file.path,
        },
        {
          new: true,
        }
      );
    }

    //update the post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("posts/updatePost", {
      error: error.message,
      post: "",
    });
  }
};

//delete post
const deletePostController = async (req, res, next) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);

    //check if post belongs to that user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("post/postDetails", {
        error: "You are not authorized to delete the post",
        post,
      });
    }
    //delete post
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    return res.render("post/postDetails", {
      error: error.message,
      post: "",
    });
  }
};

module.exports = {
  createPostController,
  fetchPostsController,
  fetchPostController,
  updatePostController,
  deletePostController,
};
