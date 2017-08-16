import React from 'react';
import { Link } from 'react-router-dom';

export const Layout = props => (
  <div className="app-container">
    <h1>
        mathnotes (2)
    </h1>
    <div className="app-content">{props.children}</div>
    <footer>
      <p>footer</p>
    </footer>
  </div>
);

export default Layout;
