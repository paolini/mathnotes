'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var NoteSchema = new Schema({
  title: {
    type: String,
    Required: 'Kindly enter a title for the note'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
    Required: 'Text cannot be empty'
  }
});

module.exports = mongoose.model('Note', NoteSchema);
