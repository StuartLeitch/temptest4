import React from 'react';

import { SidebarMenu } from '../../components';

export const SidebarMiddleNav: React.FC = () => (
  <SidebarMenu>
    <SidebarMenu.Item
      icon={<i className='fas fa-fw fa-file-invoice-dollar'></i>}
      title='Invoices'
      to='/invoices/list'
      exact
    >
      {/* <SidebarMenu.Item title='List' to='/invoices/list' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<i className='fas fa-fw fa-minus-square'></i>}
      title='Credit Notes'
      to='/credit-notes/list'
      exact
    >
      {/* <SidebarMenu.Item title='List' to='/credit-notes/list' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<i className='fas fa-ticket-alt'></i>}
      title='Coupons'
      to='/coupons/list'
      exact
    >
      {/* <SidebarMenu.Item title='List' to='/coupons/list' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<i className='fas fa-folder-open'></i>}
      title='Audit'
      to='/dashboards/audit_logs'
      exact
    >
      {/* <SidebarMenu.Item title='Logs' to='/dashboards/audit_logs' exact /> */}
    </SidebarMenu.Item>

    <SidebarMenu.Item
      title='APC'
      to='/dashboards/apc'
      exact
      icon={<i className='fas fa-landmark'></i>}
    />
  </SidebarMenu>
);
