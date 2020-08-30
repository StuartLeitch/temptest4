import React from 'react';
import { Route, Switch, Redirect } from 'react-router';

import { useAuth } from '../contexts/Auth';

// Invoicing Admin App
import InvoicesList from './Invoices/List';
import InvoiceDetails from './Invoice/Details';
import CreditNoteDetails from './Invoice/Details/CreditNote';
import CouponsList from './Coupons';
import { CouponDetails, CouponCreate } from './Coupon';

import SplitInvoice from './Invoice/SplitInvoice';

// ----------- Aiframe Pages Imports ---------------
import ProjectsDashboard from './Dashboards/Projects';
import InvoicingDashboard from './Dashboards/Invoicing';
import Financial from './Dashboards/Financial';
import NavbarOnly from './Layouts/NavbarOnly';
import SidebarWithNavbar from './Layouts/SidebarWithNavbar';
import PendingLogging from './components/PendingLogging';

// ----------- Layout Imports ---------------
import { DefaultNavbar } from '../layout/components/DefaultNavbar';
import { DefaultSidebar } from '../layout/components/DefaultSidebar';

import { SidebarANavbar } from '../layout/components/SidebarANavbar';
import { SidebarASidebar } from '../layout/components/SidebarASidebar';

//------ Route Definitions --------
export const RoutedContent = () => {
  return (
    <Switch>
      <Redirect from='/' to='/dashboards/invoicing' exact />
      {/*     Invoices Routes      */}
      <PrivateRoute path='/invoices/list' exact>
        <InvoicesList />
      </PrivateRoute>
      <PrivateRoute path='/invoices/details/:id' exact>
        <InvoiceDetails />
      </PrivateRoute>

      <PrivateRoute path='/invoices/split-invoice/:id' exact>
        <SplitInvoice />
      </PrivateRoute>
      {/* Credit Notes Routes */}
      <PrivateRoute path='/credit-notes/details/:id' exact>
        <CreditNoteDetails />
      </PrivateRoute>
      {/* Coupons Routes */}
      <PrivateRoute path='/coupons/list' exact>
        <CouponsList />
      </PrivateRoute>
      <PrivateRoute path='/coupons/details/:code' exact>
        <CouponDetails />
      </PrivateRoute>

      <PrivateRoute path='/coupons/create' exact>
        <CouponCreate />
      </PrivateRoute>
      {/* Layout Routes */}

      <PrivateRoute exact path='/dashboards/projects'>
        <ProjectsDashboard />
      </PrivateRoute>

      <PrivateRoute exact path='/dashboards/invoicing'>
        <InvoicingDashboard />
      </PrivateRoute>

      <Route path='/dashboards/financial' exact component={Financial} />
      {/*    404    */}
      <Redirect to='/pages/error-404' />
    </Switch>
  );
};

//------ Custom Layout Parts --------
export const RoutedNavbars = () => (
  <Switch>
    {/* Other Navbars: */}
    <Route component={SidebarANavbar} path='/layouts/sidebar-a' />
    <Route component={NavbarOnly.Navbar} path='/layouts/navbar' />
    <Route
      component={SidebarWithNavbar.Navbar}
      path='/layouts/sidebar-with-navbar'
    />
    {/* Default Navbar: */}
    <Route component={DefaultNavbar} />
  </Switch>
);

export const RoutedSidebars = () => (
  <Switch>
    {/* Other Sidebars: */}
    <Route component={SidebarASidebar} path='/layouts/sidebar-a' />
    <Route
      component={SidebarWithNavbar.Sidebar}
      path='/layouts/sidebar-with-navbar'
    />
    {/* Default Sidebar: */}
    <Route component={DefaultSidebar} />
  </Switch>
);

function childrenInRoute(children, pathMatch, params) {
  const toRender = <React.Suspense fallback={null}>{children}</React.Suspense>;
  return <Route {...params} render={() => toRender} />;
}

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  // * If auth is not enabled
  if (typeof auth === 'object' && !auth) {
    return childrenInRoute(children, rest.computedMatch, rest);
  }

  const { data, login } = auth;
  if (!data || !data.isAuthenticated) {
    // * Ask user to login!
    login();
  }

  if (data && 'isAuthenticated' in data && data.isAuthenticated) {
    return childrenInRoute(children, rest.computedMatch, rest);
  }
}
