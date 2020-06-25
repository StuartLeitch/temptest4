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
      <Route path='/invoices/list' exact component={InvoicesList} />
      <Route path='/invoices/details/:id' exact component={InvoiceDetails} />

      <Route path='/invoices/split-invoice/:id' exact component={SplitInvoice} />
      {/* Credit Notes Routes */}
      <Route
        path='/credit-notes/details/:id'
        exact
        component={CreditNoteDetails}
      />
      {/* Coupons Routes */}
      <Route path='/coupons/list' exact component={CouponsList} />
      <Route path='/coupons/details/:code' exact component={CouponDetails} />
      <Route path='/coupons/create' exact component={CouponCreate} />
      {/* Layout Routes */}
      <Route path='/dashboards/projects' exact component={ProjectsDashboard} />
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

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  // * If auth is not enabled
  if (typeof auth === 'object' && !auth) {
    return <React.Suspense fallback={null}>{children}</React.Suspense>;
  }

  let toRender = null;

  const { data, login } = auth;
  if (!data || !data.isAuthenticated) {
    // * Ask user to login!
    login();
  }

  if (data && 'isAuthenticated' in data && data.isAuthenticated) {
    toRender = (
      <React.Suspense fallback={<PendingLogging />}>{children}</React.Suspense>
    );
  }

  return <Route {...rest} render={() => toRender} />;
}
