
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var countryblock = new Schema({
  name: String,
  code: String,

}, {
    timestamps: true
});
countryblock.plugin(mongoosePaginate);
countryblock.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('CountryBlock', countryblock);