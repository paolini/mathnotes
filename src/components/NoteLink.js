import React from 'react';
import { Link } from 'react-router-dom';

export const NoteLink = note => (
  <Link to={`/note/${note.id}`}>
  {note.title}
  </Link>
);

export default NoteLink;
