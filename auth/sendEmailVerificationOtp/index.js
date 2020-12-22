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
  console.log('start send email verication hitted');

    UserValidator.validateSendEmailVerification(req.body).then(user => {

    let query = {"email": req.body.email}

    UserBusiness.findOne(query)
    .then( async (guser) => {

          if(!guser)
          {
            
              res.status(401)
                .send({
                    statuscode:401,
                    message:"User Not Exist",
                    response:{}
              });
          
          }
          else{ 
                let otp = Math.random().toString().replace('0.', '').substr(0, 4);
              
                mailProperty('emailVerificationMail')(guser.email, {
                  name: ` ${guser.firstName} ${guser.lastName}`,
                  email: guser.email,
                  verification_code: otp,
                  date: new Date()
                }).send();

                guser.otp  =  otp

                UserBusiness.update(guser)
                .then((updatedData) => {
      
                    UserBusiness.findOne({_id:guser._id})
                    .then( (userupdated) => {
      
                      res.status(200)
                        .send(
                          {
                            statuscode:200,
                            message:"Email with Otp Send Successfully",
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
