import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import { ToastContainer } from 'react-toastify';

import { Layout } from '../components';

import AppProviders from '../contexts';
import config from '../config';

// ----------- Layout Imports ---------------
import { DefaultHeader } from './components/DefaultHeader';
import { DefaultFooter } from './components/DefaultFooter';
import { DefaultNavbar } from './components/DefaultNavbar';

const client = new GraphQLClient({
  url: config.gqlRoot,
});

class AppLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { children } = this.props;

    return (
      <AppProviders>
        <Layout>
          <Layout.Header>
            <DefaultHeader reviewUrl={config.reviewUrl} />
          </Layout.Header>
          <Layout.Navbar>
            <DefaultNavbar />
          </Layout.Navbar>
          <Layout.Content>
            <ClientContext.Provider value={client}>
              {children}
            </ClientContext.Provider>
          </Layout.Content>
          <Layout.Footer>
            <DefaultFooter />
          </Layout.Footer>
        </Layout>

        <ToastContainer
          position='top-right'
          autoClose={5000}
          draggable={false}
          hideProgressBar={true}
        />
      </AppProviders>
    );
  }
}

export default AppLayout;
