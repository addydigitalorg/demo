'use strict';

var express =require('express')
var passport =require('passport')
var { signToken } =require('../auth.service')
var {  UserSchema } =require('../../schema/api')
var { UserBusiness } = require('../../businesses')
var { UserValidator, parseJoiError } = require('../../validators')
var { signToken } =require('../auth.service')

var router = express.Router();

router.post('/index', function(req, res, next) {
  console.log('start hit');

    UserValidator.validateSocialLogin(req.body).then(user => {

    let query = {"socialLogin.socialId": req.body.socialLogin.socialId}

    UserBusiness.findOne(query)
    .then( async (guser) => {

          if(!guser)
          {
            console.log(guser);

            UserBusiness.create({
              socialLogin:req.body.socialLogin,
              firstName:req.body.firstName,
              lastName:req.body.lastName,
              deviceId:req.body.deviceId
            })
            .then( (userSubmitted) => {

              let token = signToken(userSubmitted._id, 'guser');
              
              userSubmitted.authToken = token

              UserBusiness.update(userSubmitted)
              .then((updatedData) => {
  
                  UserBusiness.findOne({_id:userSubmitted._id})
                  .then( (userupdated) => {

                    res.status(200)
                      .send(
                        {
                          statuscode:200,
                          message:"user registered successfully",
                          response:userupdated
                        });

                  })
                  .catch((err) => 
                  {
                    res.status(401)
                      .send({
                          statuscode:401,
                          message:err.message,
                          response:err
                      });
                  });
              })
              .catch((err) => 
              {
                res.status(401)
                  .send({
                      statuscode:401,
                      message:err.message,
                      response:err
                  });
              });

            })
            .catch((err) => 
            {
              res.status(401)
                .send({
                    statuscode:401,
                    message:err.message,
                    response:err
                });
            });
          
          }
          else{
            
          let token = signToken(guser._id, 'guser');

          guser.socialLogin= req.body.socialLogin,
          guser.firstName  = req.body.firstName,
          guser.lastName   = req.body.lastName,
          guser.deviceId   = req.body.deviceId,
          guser.authToken  =  token

          UserBusiness.update(guser)
          .then((updatedData) => {

              UserBusiness.findOne({_id:guser._id})
              .then( (userupdated) => {

                res.status(200)
                  .send(
                    {
                      statuscode:200,
                      message:"Login Successfully",
                      response:userupdated
                    });

              })
              .catch((err) => 
              {
                res.status(401)
                  .send({
                      statuscode:401,
                      message:err.message,
                      response:err
                  });
              });
          })
          .catch((err) => 
          {
            res.status(401)
              .send({
                  statuscode:401,
                  message:err.message,
                  response:err
              });
          });
          }

    })
    .catch((err) => 
    {
      res.status(401)
        .send({
            statuscode:401,
            message:err.message,
            response:err
        });
    });
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

});


module.exports= router;
