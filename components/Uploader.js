'use strict';

var async = require('async')
var fs = require('fs')
var path = require('path')
var GM = require('./GM')
var AWSS3 = require('./AWSS3')
var Queue = require('./Queue')
var TmpFile = require('../schema/api')
var StringHelper = require('../helpers/StringHelper')
var config = require('../config/environment')
var { UtilsHelper } = require('../helpers')
var mv = require('mv');
const Jimp = require('jimp');

class Uploader {

  static uploadImageWithThumbnails(file, id, module, destination, cb){
    console.log('id uploader--',id,file)

    if (!file) {
    console.log('id uploader--',file)

      return cb(null,null);
    }
    var date = new Date();
    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);

    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var tempPath = file.path;
    var dir = path.join(config.imageTempFolder + "/" + module + "/" + id);
    //Set size image
    var imageSmallSize = config.imageSmallSize;
    var imageMediumSize = config.imageMediumSize;
    //Set image resize name
    var imageSmallName = "resize_" + imageSmallSize.width + "x" + imageSmallSize.height + "_" + fileName;
    var imageMediumName = "resize_" + imageMediumSize.width + "x" + imageMediumSize.height + "_" + fileName;
    //Set Path destinational
    var imageThumbPath =  dir +"/" + imageSmallName;
    var imageMediumPath =  dir +"/" + imageMediumName;
    //Setup Option resize
    var gmSmallOptions = { width: imageSmallSize.width, height: imageSmallSize.height, dest:imageThumbPath };
    var gmMediumOptions = { width: imageMediumSize.width, height: imageMediumSize.height, dest:imageMediumPath };
    console.log('dir--',dir)

    if (!fs.existsSync(dir)){
      UtilsHelper.mkdirpSync(dir,'0777');
    }

    var fileFullPath = dir + "/" + fileName;
    console.log('fileFullPath--',fileFullPath)

    async.auto({
      imageFullPath: function(callback){
        file.mv(fileFullPath, function(err) {
          console.log('error--',err)
          if (err) {
            return cb(err);
          }
          console.log('fileFullPath--',fileFullPath)

          callback(null, destination + id + "/" + fileName);
        });
      },
      imageThumbPath:  function(callback){
        Jimp.read(fileFullPath)
            .then(lenna => {
               lenna
                .resize(imageSmallSize.width, imageSmallSize.height) // resize
                .quality(60) // set JPEG quality
                .write(imageThumbPath); // save

                callback(null, destination + id + "/"+imageSmallName);

            })
            .catch(err => {
              console.error(err);
            });
      
      },
      imageMediumPath:  function(callback){
          Jimp.read(fileFullPath)
          .then(lenna => {
            lenna
              .resize(imageMediumSize.width, imageMediumSize.height) // resize
              .quality(60) // set JPEG quality
              .write(imageMediumPath); // save

              callback(null, destination + id + "/"+imageMediumName);

          })
          .catch(err => {
            console.error(err);
          });
      }
    }, function(err, result){
      console.log('result---',result)
      cb(err, result);
    });
  }

  static uploadImage(file, id, cb){
    if (!file) {
      return cb();
    }

    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var dir = path.join(config.imageTempFolder + "/users/" + id);
    if (!fs.existsSync(dir)){
      UtilsHelper.mkdirpSync(dir,'0777');
    }
    file.mv(dir +"/"+fileName, (err, data) => {
      if (err) {
        return cb(err);
      }
      cb(null, "/uploads/images/users/"+id+"/"+fileName);
    });
  }

  static uploadImageToS3(file, id, cb){
    if (!file) {
      return cb();
    }
    var date = new Date();
    var fileName = date.getFullYear().toString() + (date.getMonth()+1).toString()
      + date.getDate().toString() + date.getHours().toString()
      + date.getMinutes().toString() + date.getSeconds().toString()
      + "_" +file.name;
    var dir = path.join(config.imageTempFolder + "/users/" + id);
    if (!fs.existsSync(dir)){
      UtilsHelper.mkdirpSync(dir,'0777');
    }

    let filePath = dir +"/"+fileName;
    file.mv(file.path, filePath, function(err, data) {
      if (err) {
        return cb(err);
      }

      Queue.create('UPLOAD_S3', {
        filePath: filePath,
        fileName: fileName,
        ACL: 'public-read',
        contentType: 'image/png'
      })
      .save(() => {
        TmpFile.create({
          filePath: filePath
        });
        cb(null, AWSS3.getPublicUrl(fileName));
      });
    });
  }

  //TODO - should convert mp4 file?
  static uploadFile(file, cb) {
    if (!file) {
      return cb();
    }
    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var dir = path.join(config.fileTempFolder);
    if (!fs.existsSync(dir)) {
      UtilsHelper.mkdirpSync(dir,'0777');
    }
    file.mv( dir +"/"+fileName, function(err) {
      if (err) {
        return cb(err);
      }

      cb(null, "/uploads/files/" + fileName);
    });
  }

  static uploadFileS3(file, cb) {
    if (!file) {
      return cb();
    }

    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var dir = path.join(config.fileTempFolder);
    if (!fs.existsSync(dir)) {
      UtilsHelper.mkdirpSync(dir,'0777');
    }
    var filePath = dir +"/"+fileName;
    file.mv( dir +"/"+fileName, function(err) {
      if (err) {
        return cb(err);
      }

      Queue.create('UPLOAD_S3', {
        filePath: filePath,
        fileName: fileName,
        ACL:'public-read',
        contentType: StringHelper.getContentType(StringHelper.getExt(fileName))
      })
      .save(() => cb(null, AWSS3.getPublicUrl(fileName)));
    });
  }

  static uploadImageWithThumbnailsToS3(file, id, cb) {
    console.log('id uploader s3--',id,file)

    if (!file) {
      return cb();
    }

    var newFileName =
      StringHelper.randomString(7) +
      StringHelper.getExt(file.name || file.filename);
    var date = new Date();
    var fileName =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      "_" +
      newFileName;
    var tempPath = file.path;
    var dir = path.join(config.imageTempFolder + "/users/" + id);

    if (!fs.existsSync(dir)) {
      UtilsHelper.mkdirpSync(dir, '0777');
    }

    //Set size image
    var imageSmallSize = config.imageSmallSize;
    var imageMediumSize = config.imageMediumSize;
    //Set image resize name
    var imageSmallName = "resize_" + imageSmallSize.width + "x" + imageSmallSize.height + "_" + fileName;
    var imageMediumName = "resize_" + imageMediumSize.width + "x" + imageMediumSize.height + "_" + fileName;
    //Set Path destinational
    var imageThumbPath =  dir +"/" + imageSmallName;
    var imageMediumPath =  dir +"/" + imageMediumName;
    //Setup Option resize
    var gmSmallOptions = { width: imageSmallSize.width, height: imageSmallSize.height, dest:imageThumbPath };
    var gmMediumOptions = { width: imageMediumSize.width, height: imageMediumSize.height, dest:imageMediumPath };

    async.auto({
      imageFullPath: function(cb) {
        Queue.create('UPLOAD_S3', {
          filePath: tempPath,
          fileName: fileName,
          ACL: 'public-read',
          contentType: 'image/png'
        })
        .save(() => {
          TmpFile.create({
            filePath: tempPath
          });
          cb(null, AWSS3.getPublicUrl(fileName));
        });
      },
      imageThumbPath: function(cb) {
        GM.resize(tempPath, gmSmallOptions, (err, data) => {
          if (err) {
            return cb();
          }
          Queue.create('UPLOAD_S3', {
            filePath: data.path,
            fileName: imageSmallName,
            ACL: 'public-read',
            contentType: 'image/png'
          })
          .save(() => {
            TmpFile.create({
              filePath: data.path
            });
            cb(null, AWSS3.getPublicUrl(imageSmallName));
          });
        });
      },
      imageMediumPath: function(cb) {
        GM.resize(tempPath, gmMediumOptions, (err, data) => {
          if (err) {
            return cb();
          }
          Queue.create('UPLOAD_S3', {
            filePath: data.path,
            fileName: imageMediumName,
            ACL: 'public-read',
            contentType: 'image/png'
          })
          .save(() => {
            TmpFile.create({
              filePath: data.path
            });
            cb(null, AWSS3.getPublicUrl(imageMediumName));
          });
        });
      }
    }, function(err, results) {
      //TODO - fix error
      cb(null, results);
    });
  }

  static queueUploadFile(options, cb) {
    Queue.create('UPLOAD_S3', {
      filePath: options.filePath,
      fileName: options.fileName,
      ACL: options.ACL || 'public-read',
      contentType: options.contentType || 'video/mp4'
    })
    .save(() => cb(null, AWSS3.getPublicUrl(fileName)));
  }
}

module.exports = Uploader;
