import React from 'react';
import NoteLink from './NoteLink';
import notes from '../data/notes';

export const IndexPage = ({ athletes }) => (
  <div className="home">
    Elenco note:
    <ul className="notes">
      {notes.map(
        note => <li key={note.id}><NoteLink {...note}/></li>,
      )}
    </ul>
  </div>
);

export default IndexPage;
