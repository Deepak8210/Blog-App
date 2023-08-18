const express = require("express");
const commentRoutes = express.Router();
const {
  createCommentController,
  fetchCommentController,
  fetchCommentsController,
  updateCommentController,
  deleteCommentController,
} = require("../../controllers/comments/comments");

const isLoggedIn = require("../../middlewares/isLoggedIn");

//POST api/v1/comments --------create comment
commentRoutes.post("/:id", isLoggedIn, createCommentController);

//GET api/v1/comments/:id --------fetch single comments
commentRoutes.get("/:id", fetchCommentController);

//GET api/v1/comments/:id --------fetch all comments
commentRoutes.get("/", fetchCommentsController);

//PUT api/v1/comments/:id --------update comments
commentRoutes.put("/:id", updateCommentController);

//DELETE api/v1/comments/:id --------delete comments
commentRoutes.delete("/:id", isLoggedIn, deleteCommentController);

module.exports = commentRoutes;
