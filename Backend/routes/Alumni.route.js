const { signup } = require('../controllers/Alumni.controller');
const Alumnirouter = require('express').Router();
const upload = require('../config/multer.config');

Alumnirouter.post('/signup', upload.single('image'), signup);


module.exports = Alumnirouter;