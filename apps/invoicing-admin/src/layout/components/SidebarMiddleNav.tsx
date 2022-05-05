import React from 'react';

import { SidebarMenu } from '../../components';
import {
  IconInvoices,
  IconAPC,
  IconAuditLogs,
  IconCreditNote,
  IconCoupon,
} from '@hindawi/phenom-ui';

export const SidebarMiddleNav: React.FC = () => (
  <SidebarMenu>
    <SidebarMenu.Item
      className='invoices'
      icon={<IconInvoices className='invoices-icon' />}
      title='Invoices'
      to='/invoices/list'
      exact
    >
      {/* <SidebarMenu.Item title='List' to='/invoices/list' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<IconCreditNote />}
      title='Credit Notes'
      to='/credit-notes/list'
      exact
    >
      {/* <SidebarMenu.Item title='List' to='/credit-notes/list' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<IconCoupon />}
      title='Coupons'
      to='/coupons/list'
      exact
    >
      {/* <SidebarMenu.Item title='List' to='/coupons/list' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      title='APC'
      to='/dashboards/apc'
      exact
      icon={<IconAPC />}
    />

    <SidebarMenu.Item
      icon={<IconAuditLogs />}
      title='Audit'
      to='/dashboards/audit_logs'
      exact
    >
      {/* <SidebarMenu.Item title='Logs' to='/dashboards/audit_logs' exact /> */}
    </SidebarMenu.Item>
  </SidebarMenu>
);
