import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import AppLayout from './layout/default';
import { RoutedContent } from './routes';

import store from './store';

ReactDOM.render(
  <StrictMode>
    <Router>
      <AppLayout>
        <Provider store={store}>
          <RoutedContent />
        </Provider>
      </AppLayout>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
