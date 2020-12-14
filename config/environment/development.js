'use strict';

var path = require('path')

// Development specific configuration
// ==================================
module.exports = {
  app: {
    name: 'xfans'
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:9000/',
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/xmember-justin-smith-dev'
  },

  redis: {
    port: 6379,
    host: '161.35.161.93',
    db: 3, // if provided select a non-default redis db
    options: {
      // see https://github.com/mranney/node_redis#rediscreateclient
    }
  },
  //AWS key
  AWS: {
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx',
    region: 'us-west-1'
  },
  S3: {
    bucket: 'xxx'
  },
  elasticTranscoder: {
    pipelineId: ''
  },
  emailFrom: 'noreply@xfans.com',
  adminEmail: 'hunghoai@mailinator.com',
  sessionSecret: 'app-secret',
  ES: {
    provider: 'aws',
    region: 'us-east-1',
    hosts: 'https://xxx.us-east-1.es.amazonaws.com',
    accessKeyId: null, //null will get AWS key
    secretAccessKey: null //null will get AWS key
  },
  //set / at the end
  avatarTempFolder: path.resolve(__dirname, '../../public/assets/avatars/'),
  imageTempFolder: path.resolve(__dirname, '../../public/uploads/images/'),
  fileTempFolder: path.resolve(__dirname, '../../public/uploads/files/'),
  clientFolder: path.resolve(__dirname, '../../public/'),
  imageSmallSize: { width: 130, height: 100 },
  imageMediumSize: { width: 320, height: 240 },
  imageModelSmallSize: { width: 130, height: 180 },
  imageModelMediumSize: { width: 275, height: 350 },
  avatarSmallSize: { width: 135, height: 135 },
  avatarMediumSize: { width: 315, height: 315 },
  imageType: 'direct',//s3 or direct
  fileType: 'direct',//s3 or direct
  avatarTempBaseUrl: '/assets/avatars/',
  watermarkFile: path.resolve(__dirname, '../../assets/watermark.png'),
  tmpFolder: path.resolve(__dirname, '../../assets/.tmp'),
  useCluster: false,
  useLiverload: false,
  xssProtection: false
};
