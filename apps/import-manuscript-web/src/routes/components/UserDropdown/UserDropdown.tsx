import React, { useState } from 'react';

import { Text, IconCaretDown, IconCaretUp, Button, Dropdown, Menu } from '@hindawi/phenom-ui';
import { Preset } from '@hindawi/phenom-ui/dist/Typography/Text';

export const UserDropdown = ({ reviewUrl,...auth }) => {
  const { data } = auth;

  const [toggle, setToggle] = useState(false);

  const toggleMenu = () => {
    setToggle(!toggle);
  };

  function logOut() {
    auth.logout();
  }

  function goToAdminDashboard() {
    window.location.assign(`${reviewUrl}/admin`)
  }

  function goToProfile() {
    window.location.assign(`${reviewUrl}/profile`)
  }

  function isAdmin() {
    return data.roles && data.roles.indexOf('admin') !== -1
  }

  function adminDashboardItem() {
    if(isAdmin()) {
      return (
        <Menu.Item key="0" onClick={goToAdminDashboard}>
          <Text>Admin Dashboard</Text>
        </Menu.Item>
      )
    }
  }

  const menu = (
    <Menu>
      {adminDashboardItem()}
      <Menu.Item key="1" onClick={goToProfile}>
        <Text>My Profile</Text>
      </Menu.Item>
      <Menu.Item key="2"  onClick={logOut}>
        <Text
          key="2"
        >
          <i className='fas fa-sign-out-alt mr-2'></i>
          Log Out
        </Text>
      </Menu.Item>

    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type='text' color='link' onClick={toggleMenu}>
        <Text preset={Preset.REGULAR}>{data.name}</Text>
        {toggle ? <IconCaretUp /> : <IconCaretDown />}
      </Button>
    </Dropdown>
  );
};
