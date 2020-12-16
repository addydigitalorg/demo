var joibird = require('joibird')

class UserTempValidator {
	//validate create new data
	static validateCreating(body)  {
		var schema = joibird.object().keys({

	    name: joibird.string().min(2).required().options({
	    	language: {
	    		key: 'Name ',
	    		string: {
	    			min: 'must be greater than or equal to 2 characters'
	    		}
	    	}
		}),
		
	    provider: joibird.string().options({
	    	language: {
	    		key: 'provider ',
	    		string: {
	    			min: 'provider'
	    		}
	    	}
	    }),
	    contactNumber: joibird.string().min(10).required().options({
	    	language: {
	    		key: 'ContactNumber ',
	    		string: {
	    			min: 'must be greater than or equal to 10 characters'
	    		}
	    	}
		}),
		email: joibird.string().email().required().options({
	    	language: {
	    		key: 'Email '
	    	}
	    }),
	    password: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateSocialLogin(body)  {
		var schema = joibird.object().keys({
	    name: joibird.string().required().options({
	    	language: {
	    		key: 'name ',
	    		string: {
	    			min: 'name required'
	    		}
	    	}
		}),
		deviceId: joibird.string().required().options({
	    	language: {
	    		key: 'deviceId ',
	    		string: {
	    			min: 'name required'
	    		}
	    	}
		}),
		socialLogin: joibird.required().options({
	    	language: {
	    		key: 'socialLogin ',
	    		string: {
	    			min: 'name required'
	    		}
	    	}
		}),
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateResetPassword(body)  {
		var schema = joibird.object().keys({
	    password: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    confirmPassword: joibird.any().valid(joibird.ref('password')).required().options({
	    	language: {
	    		key: 'Confirm Password ',
	    		any: {
	    			allowOnly: 'must be equal to Password'
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateChangePassword(body) {
		var schema = joibird.object().keys({
			currentPassword: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Current Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    password: joibird.string().min(6).required().options({
	    	language: {
	    		key: 'Password ',
	    		string: {
	    			min: 'must be greater than or equal to 6 characters'
	    		}
	    	}
	    }),
	    confirmPassword: joibird.any().valid(joibird.ref('password')).required().options({
	    	language: {
	    		key: 'Confirm Password ',
	    		any: {
	    			allowOnly: 'must be equal to Password'
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}

	static validateUpdating(body)  {
		var schema = joibird.object().keys({
	    firstName: joibird.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/).max(40).options({
	    	language: {
	    		key: 'First Name ',
	    		string: {
	    			regex: {
	    				base : 'must be alphabetic',
	    				name: 'must be alphabetic'
	    			},
	    			max: 'must be less than or equal to 40 characters'
	    		}
	    	}
	    }),
	    lastName: joibird.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/).max(40).options({
	    	language: {
	    		key: 'Last Name ',
	    		string: {
	    			regex: {
	    				base : 'must be alphabetic',
	    				name: 'must be alphabetic'
	    			},
	    			max: 'must be less than or equal to 40 characters'
	    		}
	    	}
	    }),
	    cellPhoneNumber: joibird.string().regex(/^\+[0-9]{8,}$/).options({
	    	language: {
	    		key: 'Cell Phone Number ',
	    		string: {
	    			regex: {
	    				base : 'is invalid',
	    				name: 'is invalid'
	    			}
	    		}
	    	}
	    })
		});
		return joibird.validate(body, schema, {
			stripUnknown: true,
			abortEarly: false
		});
	}
}

module.exports = UserTempValidator;
