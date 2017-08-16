import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Layout } from './Layout';
import { IndexPage } from './IndexPage';
import { NotePage } from './NotePage';
import { NotFoundPage } from './NotFoundPage';
import notes from '../data/notes';

const renderIndex = () => <IndexPage/>;

const renderNote = ({ match, staticContext }) => {
    const id = match.params.id;
    let note = notes.find(note => note.id === id);
    if (!note) {
      note = notes[1];
      // return <NotFoundPage staticContext={staticContext} />;
    }
    return <NotePage note={note} />;
};

const testing = () => {
  return <NotePage note={notes[0]} />;
}

export const App = () => (
  <Layout>
    <Switch>
      <Route exact path="/" render={renderIndex} />
      <Route exact path="/pippo" render={testing} />
      <Route exact path="/note/:id" render={renderNote} />
      <Route component={NotFoundPage} />
    </Switch>
  </Layout>
);

export default App;
