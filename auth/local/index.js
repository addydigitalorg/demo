'use strict';

var express =require('express')
var passport =require('passport')
var { signToken } =require('../auth.service')
var {  UserSchema } =require('../../schema/api')
var { UserValidator, parseJoiError } = require('../../validators')
var { UserBusiness } = require('../../businesses')

var router = express.Router();

router.post('/index', function(req, res, next) {
  console.log('start hit');
 // if (req.body.type === 'user') {

    console.log('getmycontent hit');
    UserValidator.validateLogin(req.body).then(user => {

      UserBusiness.findOne({email:user.email})
      .then((data) => {

        console.log('user businss-->',data)

          data.authenticate(user.password, async function(err, isCorrect) {

            if (err || !isCorrect) {
              return res.status(401).send(
                {
                  statuscode:401,
                  message:'user not verify',
                  response:err || !isCorrect
                });
            }
    
            var token = signToken(data._id, 'user');
            data.authToken = token

            UserBusiness.update(data)
            .then((updatedData) => {

              
                UserBusiness.findOne({_id: data._id})
                .then((user) => {

                  res.status(200)
                    .send(
                      {
                        statuscode:200,
                        message:"Login Successfully",
                        response:user
                      });
                })
                .catch( (err) => {
                  
                    res.status(401).send(
                      {
                        statuscode:401,
                        message:err.message,
                        response:err
                      });
                })

            })
            .catch((err) => {
              res.status(401).send(
                {
                  statuscode:401,
                  message:err.message,
                  response:err
                });
            });


          });
      })
      .catch((err) => {
        console.log('err',err)

        res.status(401).send(
          {
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
 // }

});


module.exports= router;
