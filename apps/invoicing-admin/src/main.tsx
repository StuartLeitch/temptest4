import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router } from 'react-router-dom';

import AppLayout from './layout/default';
import { RoutedContent } from './routes';

// import App from './app/app';

ReactDOM.render(
  <Router>
    <AppLayout>
      <RoutedContent />
    </AppLayout>
  </Router>,
  document.getElementById('root')
);
