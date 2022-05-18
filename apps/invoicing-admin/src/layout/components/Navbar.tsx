import React from 'react';
import { Link } from 'react-router-dom';

import { Navbar, Nav } from '../../components';

import { NavbarUserDropdown } from './NavbarUserDropdown';

import { LogoThemed } from '../../routes/components/LogoThemed/LogoThemed';

export const InvoicingNavbar: React.FC = () => {
  return (
    <Navbar light fluid>
      <Link to='/' className='sidebar__brand'>
        <LogoThemed />
      </Link>
      <Nav navbar>
        <NavbarUserDropdown />
      </Nav>
    </Navbar>
  );
};
