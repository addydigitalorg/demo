'use strict';

var passport =require('passport')
var config =require('../config/environment')
var jwt =require('jsonwebtoken')
var expressJwt =require('express-jwt')
var compose =require('composable-middleware')
var { UserSchema } =require('../schema/api')

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
 // console.log('isAuthenticated--hitted');
  
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      // if (req.query && req.query.hasOwnProperty('access_token')) {
      //   req.headers.authorization = 'Bearer ' + req.query.access_token;
      // }
      // validateJwt(req, res, next);
      // allow access_token to be passed through query parameter as well
      let token;
      if (req.query && req.query.hasOwnProperty('access_token')) {
        token = req.query.access_token;
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      } else if (!req.headers.authorization) {
        return  res.status(401).send(
          {
            statuscode:401,
            message:'Please Provide Authorization Token',
            response:{}
          });
      } else {
        let tokenSplit = req.headers.authorization.split(' ');
        if(tokenSplit.length !== 2) {
          return  res.status(401).send(
            {
              statuscode:401,
              message:'Please Provide Correct Authorization Token',
              response:{}
            });
        }

        token = tokenSplit[1];
      }

      jwt.verify(token, config.secrets.session, function(err, decoded) {
        if (err) {
          return  res.status(401).send(
            {
              statuscode:401,
              message:err.message,
              response:err
            });
        }
          UserSchema.findById(decoded._id).exec()
            .then(user => {
              if (!user) {
                return  res.status(401).send(
                  {
                    statuscode:401,
                    message:'User Not Exist',
                    response:{}
                  });
              }
              console.log('user find in auth--',user)

              req.user = user;
              next();
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

    });
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAffiliate() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // allow access_token to be passed through query parameter as well
      // if (req.query && req.query.hasOwnProperty('access_token')) {
      //   req.headers.authorization = 'Bearer ' + req.query.access_token;
      // }
      // validateJwt(req, res, next);
      // allow access_token to be passed through query parameter as well
      let token;
      if (req.query && req.query.hasOwnProperty('access_token')) {
        token = req.query.affiliate_access_token;
      } else if (!req.headers.affiliate) {
        return res.status(401).send({
          type: 'affiliate'
        });
      } else {
        let tokenSplit = req.headers.affiliate.split(' ');
        if(tokenSplit.length !== 2) {
          return res.status(401).send({
            type: 'affiliate'
          });
        }

        token = tokenSplit[1];
      }

      jwt.verify(token, config.secrets.session, function(err, decoded) {
        if (err) {
          return res.status(401).send({
            type: 'affiliate'
          });
        }

        // TODO - fix for username, password?
        AffiliateAccount.findOne({
          _id: decoded._id
        }, function(err, account) {
          if (err || !account) {
            return res.status(403).end();
          }

          req.affiliate = account;
          next();
        });
      });
    });
}

function loadUser() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      let token;
      if (req.query && req.query.hasOwnProperty('access_token')) {
        token = req.query.access_token;
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      } else if (!req.headers.authorization) {
        return next();
      } else {
        let tokenSplit = req.headers.authorization.split(' ');
        if(tokenSplit.length !== 2) { return next(); }

        token = tokenSplit[1];
      }

      jwt.verify(token, config.secrets.session, function(err, decoded) {
        if (err) { return next(); }

        if (decoded.role === 'performer') {
          PerformerModel.findById(decoded._id).exec()
            .then(user => {
              if (!user || !user.isVerified || user.status === 'inactive') {
                return next();
              }

              req.user = user;
              req.isPerformer = true;
              next();
            })
            .catch(() => res.status(401).send());
        } else {
          UserSchema.findById(decoded._id).exec()
            .then(user => {
              if (!user) {
                return next();
              }

              req.user = user;
              next();
            })
            .catch(() => res.status(401).send());
        }
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >=
          config.userRoles.indexOf(roleRequired)) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role) {
  return jwt.sign({ _id: id, role: role }, config.secrets.session, {
    expiresIn: 60 * 60 * 24 * 30 // 30 days
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}

module.exports = {isAuthenticated,isAffiliate,loadUser,hasRole,signToken,signToken}