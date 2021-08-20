import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  Navbar,
  Nav,
  NavItem,
  SidebarTrigger,
} from '../../components';

import { LogoThemed } from '../../routes/components/LogoThemed/LogoThemed';

export const DefaultNavbar: React.FC = () => {
  const { pathname } = useLocation();
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
            <Link to='/'>Home</Link>
          </BreadcrumbItem>
          {breadcrumbs.map((breadcrumb, index) => {
            let bc;
            const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

            if (isUUID.test(breadcrumb)) {
              bc = breadcrumb;
            } else {
              bc = breadcrumb
                .replace('-', ' ')
                .replace(/\b(\w)/g, (c) => c.toUpperCase());
            }
            return (
              <BreadcrumbItem key={index} active className='navbar-text'>
                {bc}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
      </Nav>
    </Navbar>
  );
};
