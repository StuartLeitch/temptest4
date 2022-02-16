import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import AppLayout from './layout/default';
import { RoutedContent } from './routes';

ReactDOM.render(
  <StrictMode>
    <Router>
      <AppLayout>
        <RoutedContent />
      </AppLayout>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
