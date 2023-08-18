require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const globalErrHandler = require("./middlewares/globalHandler");

//requiring database connecting file
require("./config/connectDB");
const app = express();
//requiring userRoutes
const userRoutes = require("./routes/users/users");
//requiring postsRoutes
const postRoutes = require("./routes/posts/posts");
//requiring commentsRoutes
const commentRoutes = require("./routes/comments/comments");
//requiring post model
const Post = require("./model/post/Post");

//middlewares

//sending json data
app.use(express.json());
//receiving data from form
app.use(express.urlencoded({ extended: true }));
//method override
app.use(methodOverride("_method"));

//setting view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
// console.log(__dirname + "/views");
//setting static folder
app.use(express.static("public"));

//session configurations
app.use(
  session({
    secret: process.env.sessionKey,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.mongoUrl,
      ttl: 24 * 60 * 60,
    }),
  })
);

//save login user into local
app.use((req, res, next) => {
  if (req.session.userAuth) {
    res.locals.userAuth = req.session.userAuth;
  } else {
    res.locals.userAuth = null;
  }
  next();
});

//---------------HOME ROUTE----------------//
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ _id: -1 }).populate("user");
    res.render("index", { posts });
  } catch (error) {
    res.render("index.ejs", { error: error.message });
  }
});

//---------------USERS ROUTES--------------//
app.use("/api/v1/users", userRoutes);

//--------------POSTS ROUTES--------------//
app.use("/api/v1/posts", postRoutes);

//--------------COMMENTS ROUTES--------------//
app.use("/api/v1/comments", commentRoutes);

//Error Handlers
app.use(globalErrHandler);

//listening server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("running on port ", port);
});
