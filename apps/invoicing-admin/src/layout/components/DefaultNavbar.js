import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// import { TextUtils } from '@hindawi/shared';

import {
  Breadcrumb,
  BreadcrumbItem,
  Navbar,
  Nav,
  NavItem,
  SidebarTrigger
} from './../../components';

// import { NavbarActivityFeed } from './NavbarActivityFeed';
// import { NavbarMessages } from './NavbarMessages';
// import { NavbarUser } from './NavbarUser';
import { LogoThemed } from './../../routes/components/LogoThemed/LogoThemed';

export const DefaultNavbar = () => {
  let { pathname } = useLocation();
  const breadcrumbs = pathname.substring(1).split('/');

  return (
    <Navbar light expand='xs' fluid>
      <Nav navbar>
        <NavItem className='mr-3'>
          <SidebarTrigger id='defaultNavbarSidebarTrigger' />
        </NavItem>
        <NavItem className='navbar-brand d-lg-none'>
          <Link to='/'>
            <LogoThemed />
          </Link>
        </NavItem>
        <Breadcrumb tag='nav' listTag='div' className='d-none d-md-block'>
          <BreadcrumbItem className='navbar-text'>
            <a href='#'>Home</a>
          </BreadcrumbItem>
          {breadcrumbs.map(breadcrumb => {
            let bc;
            const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

            if (isUUID.test(breadcrumb)) {
              bc = breadcrumb;
            } else {
              bc = breadcrumb
                .replace('-', ' ')
                .replace(/\b(\w)/g, c => c.toUpperCase());
            }
            return (
              <BreadcrumbItem active className='navbar-text'>
                {bc}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
      </Nav>
      {/* <Nav navbar className='ml-auto'>
      <NavbarActivityFeed />
      <NavbarMessages className='ml-2' />
      <NavbarUser className='ml-2' />
    </Nav> */}
    </Navbar>
  );
};
