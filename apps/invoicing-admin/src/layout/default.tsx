import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import { ToastContainer } from 'react-toastify';

import {
  Layout,
  ThemeSelector,
  ThemeProvider,
  PageConfigConsumer,
} from '../components';

import AppProviders from '../contexts';
import config from '../config';

import '../styles/bootstrap.scss';
import '../styles/main.scss';
import '../styles/plugins/plugins.scss';
import './../styles/plugins/plugins.css';

import '@hindawi/phenom-ui/dist/styles.css';

import { RoutedNavbars, RoutedSidebars } from './../routes';

const favIcons = [
  {
    rel: 'icon',
    type: 'image/x-icon',
    href: '/assets/images/favicons/favicon.ico',
  },

  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/assets/images/favicons/apple-touch-icon.png',
  },

  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/assets/images/favicons/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/assets/images/favicons/favicon-16x16.png',
  },
];

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
        <ThemeProvider initialStyle='dark' initialColor='primary'>
          <Layout sidebarSlim favIcons={favIcons}>
            {/* --------- Navbar ----------- */}
            <Layout.Navbar>
              <RoutedNavbars />
            </Layout.Navbar>
            {/* -------- Sidebar ------------*/}
            <Layout.Sidebar>
              <RoutedSidebars />
            </Layout.Sidebar>

            {/* -------- Content ------------*/}
            <Layout.Content>
              <ClientContext.Provider value={client}>
                {children}
              </ClientContext.Provider>
            </Layout.Content>

            {/* -- Theme Selector (DEMO) ----*/}
            {/* <PageConfigConsumer>
              {({ sidebarHidden, navbarHidden }) => (
                <ThemeSelector styleDisabled={sidebarHidden && navbarHidden} />
              )}
            </PageConfigConsumer> */}
          </Layout>
          <ToastContainer
            position='top-right'
            autoClose={5000}
            draggable={false}
            hideProgressBar={true}
          />
        </ThemeProvider>
      </AppProviders>
    );
  }
}

export default AppLayout;
