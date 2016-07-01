var mongoose = require('mongoose');

var Page = mongoose.model('Page', {
  _id: String,
  content: String
});

module.exports = Page;
