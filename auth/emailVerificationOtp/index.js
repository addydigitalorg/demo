'use strict';

var express =require('express')
var passport =require('passport')
var { signToken } =require('../auth.service')
var {  UserSchema } =require('../../schema/api')
var { UserBusiness } = require('../../businesses')
var { UserValidator, parseJoiError } = require('../../validators')
var { signToken } =require('../auth.service')
var mailProperty = require('../../modules/sendMail');

var router = express.Router();

router.post('/index', function(req, res, next) {
  console.log('start email verication hitted');

    UserValidator.validateEmailVerification(req.body).then(user => {

    let query = { "email": req.body.email , otp: req.body.otp}

    UserBusiness.findOne(query)
    .then( async (guser) => {

          if(!guser)
          {
            
              res.status(401)
                .send({
                    statuscode:401,
                    message:"Either User Not Exist or Invalid Otp",
                    response:{}
              });
          
          }
          else{ 
              
            guser.emailVerify  =  true

            UserBusiness.update(guser)
            .then((updatedData) => {
  
                UserBusiness.findOne({_id:guser._id})
                .then( (guserotp) => {

                      res.status(200)
                      .send(
                        {
                          statuscode:200,
                          message:"Email and Otp Verified Successfully",
                          response:guser
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
