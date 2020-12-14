

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var IPBlocked = new Schema({
  ip: {
    type: String,
    index: true
  }

}, {
    timestamps: true
});
IPBlocked.plugin(mongoosePaginate);
IPBlocked.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('IPBlocked', IPBlocked);