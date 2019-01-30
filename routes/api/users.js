const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const passport = require('passport');

// Load user model
const User = require('../../models/User');

// Load input validator
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route   GET api/users/test
// @desc    Tests users route
// @access  public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   POST api/users
// @desc    Register user
// @access  public
router.post('/register', (req, res) => {
  // validate register input
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) return res.status(400).json(errors);
  // get request body
  const { name, email, password } = req.body;
  // validate user input
  //const { error } = validateUser(req.body);
  //if (error) return res.status(400).send(error.details[0].message);
  // check if user already exists
  User.findOne({ email }).then(user => {
    errors.email = 'Email already exists';
    if (user) return res.status(400).json(errors); // else -> continue execution below

    // Get image URL off gravatar
    const imgURL = gravatar.url(email, {
      s: '200', // Size
      r: 'pg', // Rating
      d: 'mm' // Default
    });
    // Create new User
    const newUser = new User({
      name,
      email,
      password,
      avatar: imgURL
    });
    // Hash password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        // else ->
        newUser.password = hash;
        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    });
  });
});

// @route   POST api/users
// @desc    Login users
// @access  public
router.post('/login', (req, res) => {
  // validate register input
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) return res.status(400).json(errors);
  // get request body
  const { email, password } = req.body;
  // Find User by email
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = 'User not found';
      return res.status(400).json(errors); // else -> USER IS FOUND -> continue execution below
    }
    //Check password match
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) {
        errors.password = 'Password Incorrect';
        return res.status(400).json(errors); // else -> PASSWORD IS CORRECT -> continue execution below
      }
      // Return JWT
      const token = user.generateAuthToken();
      res.json({ success: true, token: 'Bearer ' + token });
    });
  });
});

// @route   GET api/users/current
// @desc    Retrun current user
// @access  private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;
