//'use strict';

var express =require('express')
var passport =require('passport')
var config =require('../config/environment')
var { UserSchema } =require('../schema/api')

// Passport Configuration
 require('./local/passport').setup(UserSchema, config);
// require('./facebook/passport').setup(UserSchema, config);
// require('./google/passport').setup(UserSchema, config);
// require('./twitter/passport').setup(UserSchema, config);

var router = express.Router();

router.use('/local', require('./local'));
router.use('/socialLogin', require('./socialLogin'));
// router.use('/facebook', require('./facebook').default);
// router.use('/twitter', require('./twitter').default);
// router.use('/google', require('./google').default);
module.exports= router

//module.exports = {router};