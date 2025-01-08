const upload = require('../config/multer.config');
const { signup, login } = require('../controllers/Users.controllers');

const UserRouter = require('express').Router();

UserRouter.post('/signup',upload.single('image') , signup);
UserRouter.post('/login' , login);