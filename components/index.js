var Queue =require('./Queue')
//var RedisClient =require('./RedisClient')
var S3 =require('./S3')
var GM =require('./GM')
var ES =require('./ES')
var Mailer =require('./Mailer')
var Uploader =require('./Uploader')
var Paypal =require('./Paypal')
var Bitpay =require('./Bitpay')
var VideoConverter =require('./VideoConverter')
var AWSS3 =require('./AWSS3')
var ElasticTranscoder =require('./ElasticTranscoder')

module.exports = {
  Queue,
 // RedisClient,
  S3,
  GM,
  ES,
  Uploader,
  Mailer,
  Paypal,
  Bitpay,
  VideoConverter,
  AWSS3,
  ElasticTranscoder
}
