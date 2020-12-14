'use strict';

var express =require('express')
var passport =require('passport')
var { signToken } =require('../auth.service')
var {  UserSchema } =require('../../schema/api')

var router = express.Router();

router.post('/', function(req, res, next) {
  console.log('start hit');
  if (req.body.type === 'user') {
    console.log('getmycontent hit');
  
      if (!req.body.email) {
        return res.status(400);
      }
  
      return UserSchema.findOne({
        email: req.body.email.toLowerCase()
      }, function(err, guser) {
        if (err) {
          return res.status(401).send({
            verified: false
          });
        }
  
        // if (!guser) {
        //   return res.status(404).send({
        //     isExist: false
        //   });
        // }
  
        // if (!guser.emailVerified) {
        //   return res.status(401).send({
        //     emailVerified: false
        //   });
        // }

        // if ( guser.status === 'inactive') {
        //   return res.status(401).send({
        //     isActive: false
        //   });
        // }
  
        guser.authenticate(req.body.password, function(err, isCorrect) {
          if (err || !isCorrect) {
            return res.status(401).send({
              verified: false
            });;
          }
  
          var token = signToken(guser._id, 'guser');
          res.json({ token , guser:guser});
        });
      });
    }


  passport.authenticate('local', function(err, user, info) {
  console.log('user--->',user);

    var error = err || info;
    if (error || !user.emailVerified) {
      return res.status(401).send({
        verified: false
      });
    }
    if (!user) {
      return res.status(404).json({message: 'No user found'});
    }
//    if(user.role=='admin'){
//      return res.status(404).json({message: 'Your role is admin. Please create new account.'});
//    }
    var token = signToken(user._id, user.role);
    res.json({ token });
  })(req, res, next);
});


module.exports= router;
