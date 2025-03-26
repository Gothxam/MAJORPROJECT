const User = require("../models/user");

//signup route
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

//user signup
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to EasyBnB!");
      res.redirect("/listings");
    });
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
module.exports.login = (req, res) => {
  const redirectUrl = req.session.returnTo || "/listings"; // Redirect to the original URL or a default page
  delete req.session.returnTo; // Clear the session variable
  req.flash("success", "Welcome back!");
  res.redirect(redirectUrl);
};

//user logout
module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
