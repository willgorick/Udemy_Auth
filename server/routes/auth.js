const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

const router = express.Router();
const validate = [
  body('fullName')
    .isLength({ min: 2 })
    .withMessage('Your full name is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
]

const generateToken = user => {
  return jwt.sign(
    { _id: user._id, email: user.email, fullName: user.fullName },
    process.env.KEY
  )
}

router.post('/register', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) return res.status(400).send({
    success: false,
    message: "Email is already registered"
  });

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: hashPassword
  })
  try {
    const savedUser = await user.save();
    const token = generateToken(user);
    res.send({
      success: true,
      data: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email
      },
      token
    });
  } catch (err) {
    res.status(400).send({success: false, error: err})
  }
});

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
]

router.post('/login', loginValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Check if email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send({ success: false, message: "No user with this email address exists" })


  // Check if password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(404).send({ success: false, message: 'Password does not match this email address.' })

  // Create and assing a token
  const token = generateToken(user);
  res.header('auth-token', token).send({success: true, message: 'Logged in', token})
});

module.exports = router;