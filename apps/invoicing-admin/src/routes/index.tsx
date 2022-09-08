import { Navigate, Route, Routes } from 'react-router-dom';
import { ClientContext } from 'graphql-hooks';
import React, { useContext } from 'react';

import { useAuth } from '../contexts/Auth';

// Invoicing Admin App
import CreditNoteDetails from './CreditNote/CreditNote';
import {
  CouponDetails,
  CouponCreate,
  CreateMultipleCouponPage,
} from './Coupon';
import InvoiceSearchPage from './InvoiceSearchPage';
import SplitInvoice from './Invoice/SplitInvoice';
import CreditNotesList from './CreditNotes/List';
import InvoiceDetails from './Invoice/Details';
import InvoicesList from './Invoices/List';
import CouponsList from './Coupons';
import AuditLogs from './AuditLogs';
import ApcList from './APC';

export const RoutedContent = () => {
  const client = useContext(ClientContext);
  const auth = useAuth();
  if (!auth) {
    return null;
  }
  const { token } = auth.data;

  // ! Do not use '===' for checking
  if (client.headers['Authorization'] == null) {
    client.setHeader('Authorization', `Bearer ${token}`);
  }

  return (
    <Routes>
      <Route path='/' element={<Navigate to='/invoices/search' replace />} />

      {/*     Invoices Routes      */}
      <Route
        path='/invoices/list'
        element={
          <PrivateRoute>
            <InvoicesList />
          </PrivateRoute>
        }
      />
      <Route
        path='/invoices/details/:id'
        element={
          <PrivateRoute>
            <InvoiceDetails />
          </PrivateRoute>
        }
      />
      <Route
        path='/invoices/search'
        element={
          <PrivateRoute>
            <InvoiceSearchPage />
          </PrivateRoute>
        }
      />
      {/* <Route exact path='/invoices/split-invoice/:id'>
        <PrivateRoute>
          <SplitInvoice />
        </PrivateRoute>
      </Route> */}

      {/* Credit Notes Routes */}
      <Route
        path='/credit-notes/list'
        element={
          <PrivateRoute>
            <CreditNotesList />
          </PrivateRoute>
        }
      />
      <Route
        path='/credit-notes/details/:id'
        element={
          <PrivateRoute>
            <CreditNoteDetails />
          </PrivateRoute>
        }
      />

      {/* Coupons Routes */}
      <Route
        path='/coupons/list'
        element={
          <PrivateRoute>
            <CouponsList />
          </PrivateRoute>
        }
      />
      <Route
        path='/coupons/details/:code'
        element={
          <PrivateRoute>
            <CouponDetails />
          </PrivateRoute>
        }
      />
      <Route
        path='/coupons/create'
        element={
          <PrivateRoute>
            <CouponCreate />
          </PrivateRoute>
        }
      />

      <Route
        path='/coupons/bulk-create'
        element={
          <PrivateRoute>
            <CreateMultipleCouponPage />
          </PrivateRoute>
        }
      />

      {/* Extra Admin Routes */}
      <Route
        path='/audit_logs/list'
        element={
          <PrivateRoute>
            <AuditLogs />
          </PrivateRoute>
        }
      />
      <Route
        path='/apc/list'
        element={
          <PrivateRoute>
            <ApcList />
          </PrivateRoute>
        }
      />

      <Route path='*' element={<Navigate to='/invoices/search' replace />} />
    </Routes>
  );
};

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  // * If auth is not enabled
  if (typeof auth === 'object' && !auth) {
    return children;
  }

  const { data, login } = auth;
  if (!data || !data.isAuthenticated) {
    // * Ask user to login!
    login();
  }

  if (data && 'isAuthenticated' in data && data.isAuthenticated) {
    return children;
  }
}
