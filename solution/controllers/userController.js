const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

const registerUserTitle = "Register user";

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};
exports.registerForm = (req, res) => {
  res.render("register", { title: registerUserTitle });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("password", "Password cannot be blank!").notEmpty();
  req
    .checkBody("confirm-password", "Confirm Password cannot be blank!")
    .notEmpty();
  req
    .checkBody("confirm-password", "Oops, your passwords do not match!")
    .equals(req.body.password);

  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody("email", "You must supply an email!").notEmpty().isEmail();

  const errors = req.validationErrors();
  if (errors) {
    req.flash(
      "error",
      errors.map((err) => err.msg)
    );
    res.render("register", {
      title: registerUserTitle,
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const { email, name } = req.body;
  const user = new User({
    email,
    name,
  });
  const registerWithPromise = promisify(User.register, User);
  await registerWithPromise(user, req.body.password);
  next();
};
exports.account = (req, res) => {
  res.render("account", { title: "Edit your account" });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  );
  res.redirect("back");
};
