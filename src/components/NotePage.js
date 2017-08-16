import React from 'react';
import { Link } from 'react-router-dom';

export const NotePage = ({ note }) => {
  return (
    <div className="note">
    Title: {note.title} <br />
    Text: {note.text}
    </div>
  );
};

export default NotePage;
