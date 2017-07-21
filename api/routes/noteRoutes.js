'use strict';
module.exports = function(app) {
  var notes = require('../controllers/noteController');


  // todoList Routes
  app.route('/notes')
    .get(notes.list_all_notes)
    .post(notes.create_a_note);


  app.route('/notes/:noteId')
    .get(notes.read_a_note)
    .put(notes.update_a_note)
    .delete(notes.delete_a_note);
};
