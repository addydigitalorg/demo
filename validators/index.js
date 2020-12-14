var _ =require('lodash')
var UserValidator =require('./userValidator')


let parseJoiError = (err) => {
	let errors = {};
  _.map(err.details, e => {
  	if(!errors[e.path]) {
  		errors[e.path] = [];
  	}
    errors[e.path].push(e.message);
  });
  return errors;
};

module.exports= {
	parseJoiError,
	UserValidator
};
