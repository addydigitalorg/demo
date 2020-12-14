'use strict';

var express =require('express')
var passport =require('passport')
var {setTokenCookie} =require('../auth.service')

var router = express.Router();

router
  .get('/', passport.authenticate('google', {
    failureRedirect: '/signup',
    scope: [
      'profile',
      'email'
    ],
    session: false
  }))
  .get('/callback', passport.authenticate('google', {
    failureRedirect: '/signup',
    session: false
  }), setTokenCookie);


  module.exports=router;
