import React from 'react';
import {
  IconInvoices,
  IconAPC,
  IconAuditLogs,
  IconCreditNote,
  IconCoupon,
} from '@hindawi/phenom-ui';

import { SidebarMenu, Sidebar } from '../../components';

export const InvoicingSidebar: React.FC = () => (
  <Sidebar slim={true} animationsDisabled={true}>
    <SidebarMenu>
      <SidebarMenu.Item
        className='invoices'
        icon={<IconInvoices className='invoices-icon' />}
        title='Invoices'
        to='/invoices/list'
        exact
      />

      <SidebarMenu.Item
        icon={<IconCreditNote />}
        title='Credit Notes'
        to='/credit-notes/list'
        exact
      />

      <SidebarMenu.Item
        icon={<IconCoupon />}
        title='Coupons'
        to='/coupons/list'
        exact
      />

      <SidebarMenu.Item title='APC' to='/apc/list' exact icon={<IconAPC />} />

      <SidebarMenu.Item
        icon={<IconAuditLogs />}
        title='Audit'
        to='/audit_logs/list'
        exact
      />
    </SidebarMenu>
  </Sidebar>
);
