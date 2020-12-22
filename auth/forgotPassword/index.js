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
  console.log('start hit');

    UserValidator.validateForgotPassword(req.body).then(user => {

    let query = {"_id": req.body._id}

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

          UserBusiness.forgotPassword({_id:guser._id}, req.body.password)
          .then((updatedData) => {
                console.log('updatedData--',updatedData);

                
                mailProperty('forgotPasswordMail')(guser.email, {
                  name: ` ${guser.firstName} ${guser.lastName}`,
                  password: req.body.password,
                  date: new Date()
                }).send();
              

                res.status(200)
                  .send(
                    {
                      statuscode:200,
                      message:"User Password Updated Successfully",
                      response:updatedData
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
