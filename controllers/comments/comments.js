const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const Comment = require("../../model/comment/Comment");
const appErr = require("../../utils/appErr");

//create comment
const createCommentController = async (req, res, next) => {
  const { message } = req.body;
  try {
    //find the post
    const post = await Post.findById(req.params.id);

    //create comment
    const createComment = await Comment.create({
      user: req.session.userAuth,
      message,
      post: post._id,
    });
    //push that comment to post
    post.comments.push(createComment._id);
    //find the user
    const user = await User.findById(req.session.userAuth);
    //push that comment to user
    user.comments.push(createComment._id);

    //disable validation
    //save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    //redirect
    res.redirect(`/api/v1/posts/${post?._id}`);
  } catch (error) {
    return next(appErr(error.message));
  }
};

//fetch all comments
const fetchCommentsController = async (req, res, next) => {
  try {
    const comments = await Comment.find();
    res.json({
      status: "success",
      data: comments,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//fetch single comment page to update
const fetchCommentController = async (req, res, next) => {
  try {
    // get id from params
    const id = req.params.id;
    //find the post
    const comment = await Comment.findById(id);
    res.render("posts/updateComment", {
      error: "",
      comment,
    });
  } catch (error) {
    return res.render("posts/updateComment", {
      error: error.message,
    });
  }
};

//update comment
const updateCommentController = async (req, res, next) => {
  try {
    // find the comment
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(appErr("no comments to delete"));
    }
    //check if post belongs to that user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not authorized to update ", 403));
    }

    //update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
      },
      {
        new: true,
      }
    );

    //redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    return next(appErr(error.message));
  }
};

//delete comment
const deleteCommentController = async (req, res, next) => {
  try {
    // find the comment
    const comment = await Comment.findById(req.params.id);

    //check if post belongs to that user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not authorized to delete this comment", 403));
    }
    //delete comment
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    //redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    return next(appErr(error.message));
  }
};

module.exports = {
  createCommentController,
  fetchCommentController,
  fetchCommentsController,
  updateCommentController,
  deleteCommentController,
};
