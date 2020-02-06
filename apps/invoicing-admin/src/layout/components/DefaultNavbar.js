import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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
            return (
              <BreadcrumbItem active className='navbar-text'>
                {breadcrumb.replace(/^\w/, c => c.toUpperCase())}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
        {/* <NavItem className="d-none d-md-block">
                <span className="navbar-text">
                    <Link to="/">
                        <i className="fas fa-home"></i>
                    </Link>
                </span>
                <span className="navbar-text px-2">
                    <i className="fas fa-angle-right"></i>
                </span>
                <span className="navbar-text">
                    <Link to="/">Start</Link>
                </span>
                <span className="navbar-text px-2">
                    <i className="fas fa-angle-right"></i>
                </span>
                <span className="navbar-text">
                    Page Link
                </span>
</NavItem> */}
      </Nav>
      {/* <Nav navbar className='ml-auto'>
      <NavbarActivityFeed />
      <NavbarMessages className='ml-2' />
      <NavbarUser className='ml-2' />
    </Nav> */}
    </Navbar>
  );
};
