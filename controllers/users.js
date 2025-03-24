const User = require("../models/user")

//signup route
module.exports.renderSignupForm=(req, res) => {
  res.render("users/signup.ejs");
}

//user signup
module.exports.signup=async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser,(err)=>{
        if(err){
          return next(err)
        }
        req.flash("success", "Welcome to EasyBnB!");
        res.redirect("/listings");
      })
  
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  };

//login route
  module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
  };

//user login
  module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back to EasyBnB!");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }

//user logout
  module.exports.logout=(req,res,next)=>{
    req.logOut((err)=>{
      if(err){
        next(err);
      }
      req.flash("success","you are logged out!");
      res.redirect("/listings");
    })
  }