var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var crypto = require('crypto');
var _ = require('lodash');

const authTypes = ['apple', 'facebook', 'google', 'socialLogin'];
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var Schema = mongoose.Schema;
var UserSchema = new Schema({
            firstName       : { type: String, default: '' },
            lastName        : { type: String, default: '' },
            profileImage    : { type: String, default: '' },
            selfieImage     : { type: String, default: '' },
            nickName        : { type: String, default: '' },
            gender          : { type: String },
            imageType       : { type: String },
            photo           : { type: String },
            imageMediumPath : { type: String },
            imageThumbPath  : { type: String },
            email           : {
                                type: String,
                                lowercase: true,
                                required: function() {
                                  console.log('this.name email-->',this.socialLogin.type)
                                  console.log('this.name email-->',this.deviceId)

                                  if (authTypes.indexOf(this.socialLogin.type) === -1) {
                                    return true;
                                  } else {
                                    return false;
                                  }
                                }
                              },
            contactNumber   : { type: String, default: '' },
            location        : { type: String, default: '' },
            age             : { type: Number },
            country         : { type: String, default: '' },
            city            : { type: String, default: '' },
            dob             : { type: Date},
            email_verify    : { type: Boolean, default: false },
            otp             : { type: String, default: '' },
            salt            : String,
            password        : {
                                type: String,
                                required: function() {
                                  if (authTypes.indexOf(this.socialLogin.type) === -1) {
                                    return true;
                                  } else {
                                    return false;
                                  }
                                }
                              },
            authToken       : { type: String, default: '' },
            appType         : { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
            role            : { type: String, enum: ['user', 'admin'], default:'user'},
            socialLogin     : { 
                                socialId : { type: String, default: '' },
                                image    : { type: String, default: '' },      
                                type     : { type: String, default: '' }           
                              },
            deviceToken     : { type: String, default: '' },
            deviceId        : { type: String, default: '' },
            status          : { type: Boolean, default: true },
            geoLocation     : {
                                type: [Number],
                                index: '2d'
                              },                           
            emailVerifiedToken  : { type: String, default: '' }

    }, 
    {
     timestamps: true
    });



/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'firstName': this.firstName,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    console.log('this.socialLogin.type email-->',this.socialLogin.type)

    if (authTypes.indexOf(this.socialLogin.type) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    console.log('this.socialLogin.type password-->',this.socialLogin.type)

    if (authTypes.indexOf(this.socialLogin.type) !== -1) {
      return true;
    }
    return password.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    console.log('this.socialLogin.type-->',this.socialLogin.type)
    console.log('this.authTypes-->',authTypes)
    if (authTypes.indexOf(this.socialLogin.type) !== -1) {

      return respond(true);
    }

    return this.constructor.findOne({ email: value }).exec()
      .then(function(user) {
        if (user) {
          if (self.id === user.id || self.role=='admin') {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    this.wasNew = this.isNew;

    if (this.isNew) {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
    // Handle new/update passwords
    if (!this.isModified('password')) {
      return next();
    }
    if (!validatePresenceOf(this.password)) {
      if (authTypes.indexOf(this.socialLogin.type) === -1) {
        return next(new Error('Invalid password'));
      } else {
        return next();
      }
    }

    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
      if (saltErr) {
        return next(saltErr);
      }
      this.salt = salt;
      this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
        if (encryptErr) {
          return next(encryptErr);
        }
        this.password = hashedPassword;
        next();
      });
    });
  });

  UserSchema
    .post('save', function(next) {
      if (this.wasNew && this.email) {
    
      }
    });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} byteSize Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    if (!callback) {
      return crypto.randomBytes(byteSize).toString('base64');
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        callback(err);
      } else {
        callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if (!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1')
                   .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', (err, key) => {
      if (err) {
        callback(err);
      } else {
        callback(null, key.toString('base64'));
      }
    });
  },

  publicProfile() {
    return _.pick(this, [
      'firstName',
      'lastName',
      'phone',
      'photo',
      'imageThumbPath',
      'imageMediumPath',
      'country',
      'city',
      'imageType',
      'role',
      '_id'
    ]);
  }
},
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('User', UserSchema);