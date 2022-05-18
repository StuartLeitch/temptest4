import React from 'react';

import {
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '../../components';
import { useAuth } from '../../contexts/Auth';

const NavbarUserDropdown = () => {
  const auth = useAuth();

  if (!auth) {
    return null;
  }
  const { name, username, roles } = auth.data;

  return (
    <React.Fragment>
      <UncontrolledButtonDropdown>
        <DropdownToggle
          color='link'
          className='pl-0 pb-0 btn-profile sidebar__link'
        >
          {username}
          <i className='fas fa-angle-down ml-2'></i>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header>
            <strong>{name}</strong>
          </DropdownItem>
          <DropdownItem header>
            <i className='fas fa-user-secret mr-2'></i>{' '}
            {roles &&
              roles[0].replace(/_/g, ' ').replace(/(^|\s)\S/g, function (t) {
                return t.toUpperCase();
              })}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem
            onClick={(evt) => {
              evt.preventDefault();
              auth.logout();
            }}
          >
            <i className='fas fa-sign-out-alt mr-2'></i>
            Sign Out
          </DropdownItem>
        </DropdownMenu>{' '}
      </UncontrolledButtonDropdown>
    </React.Fragment>
  );
};

export { NavbarUserDropdown };
