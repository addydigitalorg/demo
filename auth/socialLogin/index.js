'use strict';

var express =require('express')
var passport =require('passport')
var { signToken } =require('../auth.service')
var {  UserSchema } =require('../../schema/api')
var { UserBusiness } = require('../../businesses')
var { UserValidator, parseJoiError } = require('../../validators')
var { signToken } =require('../auth.service')

var router = express.Router();

router.post('/', function(req, res, next) {
  console.log('start hit');
  if (req.body.type === 'socialLogin') {

    UserValidator.validateSocialLogin(req.body).then(user => {

    let query = {"socialLogin.socialId": req.body.socialLogin.socialId}

     UserSchema.findOne(query, async function(err,guser) {
      if (err) {
        return res.status(401)
                  .send({
                    statuscode:401,
                    message:err.message,
                    response:err
                  });
      }
      console.log('user--',guser)

      if(!guser)
      {
        console.log(guser);

       let usersubmittd =  await UserBusiness.create({
          socialLogin:req.body.socialLogin,
          name:req.body.name,
          deviceId:req.body.deviceId
        });

        let token = signToken(usersubmittd._id, 'guser');

        await UserSchema.update(
          {_id: guser._id},
          {
          $set :{
            authToken: token
          }
          })

        let userupdated =  await UserSchema.findOne(query)

        return res.status(200)
                  .send(
                    {
                      statuscode:200,
                      message:"user registered successfully",
                      response:userupdated
                    });
      
      }
      else{
        
      let token = signToken(guser._id, 'guser');
       await UserSchema.update(query,
          {
            $set:{
                  socialLogin:req.body.socialLogin,
                  name       :req.body.name,
                  deviceId   :req.body.deviceId,
                  authToken  : token
                 }
          });
        let userupdated =  await UserSchema.findOne(query)

        return res.status(200)
                  .send(
                    {
                      statuscode:200,
                      message:"user updated successfully",
                      response:userupdated
                    });
      }

    })
  })
  .catch((err) => 
  {
    res.status(400)
      .send({
          statuscode:401,
          message:err.cause.details[0].message,
          response:err
      });
  });

  }


//   passport.authenticate('local', function(err, user, info) {
//   console.log('user--->',user);

//     var error = err || info;
//     if (error || !user.emailVerified) {
//       return res.status(401).send({
//         verified: false
//       });
//     }
//     if (!user) {
//       return res.status(404).json({message: 'No user found'});
//     }
// //    if(user.role=='admin'){
// //      return res.status(404).json({message: 'Your role is admin. Please create new account.'});
// //    }
//     var token = signToken(user._id, user.role);
//     res.json({ token });
//   })(req, res, next);
});


module.exports= router;
