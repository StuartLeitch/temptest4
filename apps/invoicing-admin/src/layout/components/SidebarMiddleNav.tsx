import React from 'react';

import { SidebarMenu } from '../../components';

export const SidebarMiddleNav: React.FC = () => (
  <SidebarMenu>
    <SidebarMenu.Item
      icon={<i className='fas fa-fw fa-file-invoice-dollar'></i>}
      title='Invoices'
    >
      <SidebarMenu.Item title='List' to='/invoices/list' exact />
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<i className='fas fa-fw fa-file-invoice-dollar'></i>}
      title='Credit Notes'
    >
      <SidebarMenu.Item title='List' to='/credit-notes/list' exact />
    </SidebarMenu.Item>

    <SidebarMenu.Item
      icon={<i className='fas fa-ticket-alt'></i>}
      title='Coupons'
    >
      <SidebarMenu.Item title='List' to='/coupons/list' exact />
    </SidebarMenu.Item>
  </SidebarMenu>
);
