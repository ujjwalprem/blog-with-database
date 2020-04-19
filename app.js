
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const homeStartingContent = " Welcome to the blog!. If you checked out the “ About Us” page then you know my name is UJJWAL.  Looking at the front page, you probably saw that this is a General porpuse blog. Glad you came by.  I wanted to welcome you and let you know I appreciate you spending time here at the blog very much.  Everyone is so busy and life moves pretty fast,  so I really do appreciate you taking time out of your busy day to check out my blog!.Thanks. YOU CAN WRITE YOUR BLOG BY CLICKING ON CREATE BLOG🤩";
const aboutContent = "This Ujjwal Kumar, Developer of this awesome Blog website.Hope you will enjoy by reading the blogs availabe on our plattform.";
const contactContent ="Email:ujjwalkumarprem@gmail.com";


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb+srv://admin-ujjwal:Ujjwal0508@cluster0-mfnvy.mongodb.net/blogDB2", {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);
const postschema = new mongoose.Schema({
  title: String,
  content: String,
  email: String,
  password: String,
  name: String
});


postschema.plugin(passportLocalMongoose);
postschema.plugin(findOrCreate);
const Post = mongoose.model("Post", postschema);



passport.use(Post.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Post.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/", function(req, res) {

  Post.find({}, function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts

      });
    }

  });
});

app.get("/compose", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.redirect("/login");
  }
});
app.get("/login", function(req, res) {
  res.render("login");
});
app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {

  Post.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/compose");
      });
    }
  });

});


app.post("/compose", function(req, res) {
      const post = new Post({
        title: req.body.titleBody,
        content: req.body.postBody,
        name:req.body.nameBody
      });



      Post.findById(req.user.id, function(err, foundUser) {

        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
                  foundUser.title=post.title;
                  foundUser.content=post.content;
                  foundUser.name=post.name;
      foundUser.save(function(err)
    {
      if(!err){
        res.redirect("/");
      }
    });
          }
        }
      });
    });





      app.post("/login", function(req, res) {

        const user = new Post({
          username: req.body.username,
          password: req.body.password
        });

        req.login(user, function(err) {
          if (err) {
            console.log(err);
          } else {
            passport.authenticate("local")(req, res, function() {
              res.redirect("/compose");
            });
          }
        });

      });


      // app.get("/posts/:postId", function(req, res){
      //
      // const requestedPostId = req.params.postId;
      //
      //   Post.findOne({_id: requestedPostId}, function(err, post){
      //     res.render("post", {
      //       title: post.title,
      //       content: post.content
      //     });
      //   });
      //
      // });

      app.get("/about", function(req, res) {
        res.render("about", {
          aboutContent: aboutContent,
          contactContent:contactContent
        });
      });

      app.get("/contact", function(req, res) {
        res.render("contact", {
          contactContent: contactContent
        });
      });


      app.listen(3000, function() {
        console.log("Server started on port 3000");
      });
