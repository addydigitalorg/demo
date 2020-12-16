/**
 * Main application routes
 */

"use strict";
var express = require("express");
var bodyParser = require('body-parser');

var errors = require("../components/errors")
var path = require("path")
var auth = require("../auth/auth.service")
var userController = require("../api/v1/userController")
var geoBusiness =require("../businesses/geoBusiness")

var multer = require("multer")
var config = require("../config/environment")
var { StringHelper } = require("../helpers")


var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.fileTempFolder);
  },

  filename: function(req, file, cb) {
    let name =
      StringHelper.randomString(7) +
      "_" +
      StringHelper.getFileName(file.originalname);

    cb(null, name);
  }
});
var upload = multer({
  storage
});

function validateAdminOrPerformer(req, res, next) {
  if (req.user.role !== "admin" && !req.isPerformer) {
    return res.status(403).end();
  }

  next();
}

var whiteListIps = ["0.0.0.1"];
const checkBlocked = function(req, res, next) {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (whiteListIps.indexOf(ip) > -1 || ip.indexOf('64.38.212') > -1 || ip.indexOf('64.38.215') > -1 || ip.indexOf('64.38.240') > -1 || ip.indexOf('64.38.241') > -1) {
    return next();
  }
  geoBusiness.checkBlocked(ip, function(err, blocked) {
    if (err || blocked) {
      return res.status(403).send();
    }

    return next();
  });
};


  var app = express.Router();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
      extended: false
  }));
  console.log('app routes hitted');
  
  app.get("/v1/test",  function(req,res){
    console.log('test hitted');
    res.send('hi')
  });

  //app.use("*", checkBlocked);

    
  app.post(
    "/v1/users/register",
     userController.create
   ); 

   app.get(
     "/v1/users",  
     userController.index
     );


  // Insert routes below
  app.get("/api/v1/users/me", auth.isAuthenticated(), userController.me);
  app.put(
    "/api/v1/users/password",
    auth.isAuthenticated(),
    userController.changePassword
  );
  app.put(
    "/api/v1/users/:id/update-profile",
    auth.isAuthenticated(),
    userController.updateProfile
  );
  app.post(
    "/api/v1/users/photo",
    auth.isAuthenticated(),
    multipartMiddleware,
    userController.updatePhoto
  );
  // app.post(
  //   "/api/v1/users",
  //   auth.loadUser(),
  //   multipartMiddleware,
  //   userController.create
  // );
  app.post(
    "/api/v1/users/download",
    auth.isAuthenticated(),
    userController.downloadVideo
  );
  app.post(
    "/api/v1/users/favorite",
    auth.isAuthenticated(),
    userController.favoriteVideo
  );
  app.put(
    "/api/v1/users/favorite",
    auth.isAuthenticated(),
    userController.removeFavoriteVideo
  );
  app.post(
    "/api/v1/users/watch-later",
    auth.isAuthenticated(),
    userController.watchLaterVideo
  );
  app.put(
    "/api/v1/users/watch-later",
    auth.isAuthenticated(),
    userController.removeWatchLaterVideo
  );
  app.post("/api/v1/users/forgot", userController.forgot);
  app.delete(
    "/api/v1/users/:id",
    auth.hasRole("admin"),
    userController.destroy
  );
  app.get("/api/v1/users/:id", auth.hasRole("admin"), userController.show);
  app.put(
    "/api/v1/users/:id",
    auth.hasRole("admin"),
    multipartMiddleware,
    userController.update
  );
  //app.get("/api/v1/users", auth.hasRole("admin"), userController.index);
  app.get("/api/v1/users/check/uservip", userController.checkVip);

  app.get("/api/v1/users/verifyEmail/:token", userController.verifyEmail);
  //app.use("/auth", require("../auth"));

  app.post("/api/v1/server/reload", auth.hasRole("admin"), function(req, res) {
    var pm2Id = process.env.PM2_ID || 0;
    var cmd = `pm2 reload ${pm2Id}`;

    exec(cmd, function(error, stdout, stderr) {
      res.status(200).end();
    });
  });

  // All undefined asset or api routes should return a 404
  app
    .route(
      "/:url(api|auth|components|app|bower_components|assets|lib|styles)/*"
    )
    .get(errors[404]);
  app.get(/^\/backend(.*)$/, (req, res) => {
    res.sendFile(path.resolve("backend/index.html"));
  });
  // All other routes should redirect to the index.html
  app.route("/*").get((req, res) => {
    res.sendFile(path.resolve(app.get("appPath") + "/index.html"));
  });
  module.exports= app
