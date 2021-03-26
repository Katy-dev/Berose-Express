const {Router} = require('express');
const bcrypt = require ('bcryptjs');
const { check, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const router = Router();

// /api/auth/register
router.post(
    '/register',
    [
    check('email', 'Incorrect email').isEmail(),
    check('password', 'Min length password is 6 characters ').isLength({ min:6 }),
],
    async (req, res) =>{

  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        statusCode: 400,
        message: 'Incorrect data'
      });
    }
    const {email, password} = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
     return res.status(400).json({ statusCode: 400, message:'Such a user already exists'})
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: req.body.email,
      password: hashPassword });
    await user.save();

    res.status(201).json({ statusCode: 201, message: "User was created"});

  } catch (e) {
    res.status(500).json({message: 'Something wrong, try again'})
  }
});

// /api/auth/login
router.post('/login',
    [
        check('email', 'Please, enter the correct email').normalizeEmail().isEmail,
        check('password', 'Please,enter password').exists(),
    ],
    async (req, res) => {

  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        statusCode: 400,
        message: 'Incorrect data',
      });
    }

    const {email, password} = req.body;
    console.log(req.body)
    const user = await User.findOne({ email });
       console.log(user, "login")
    if (!user) {
      return res.status(400).json({ statusCode: 400, message:'User not found'})
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      return res.status(400).json({ statusCode: 400,message: 'Incorrect password or email'});
    }
    const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expireIn: '1h' }
    );
    res.status(200).json({ statusCode: 200, token,userId: user.id });

  } catch (e) {
    res.status(500).json({message: 'Something wrong, try again'})
  }
});

module.exports = router;