import React from 'react';
import { Link } from 'react-router-dom';

import {
  Sidebar,
  UncontrolledButtonDropdown,
  Avatar,
  AvatarAddOn,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '../../../components';
import { useAuth } from '../../../contexts/Auth';
import { avatarZero } from '../../../utilities';

const SidebarTopA = () => {
  const auth = useAuth();

  if (!auth) {
    return null;
  }
  const { picture = avatarZero(), name, profile, username, roles } = auth.data;

  return (
    <React.Fragment>
      {/* START: Sidebar Default */}
      {/* <Sidebar.HideSlim>
        <Sidebar.Section className='pt-0'> */}
          {/* <Link to='/' className='d-block'>
            <Sidebar.HideSlim>
              <Avatar.Image
                size='md'
                src={picture}
                addOns={[
                  <AvatarAddOn.Icon
                    className='fa fas fa-circle'
                    color='white'
                    key='avatar-icon-bg'
                  />,
                  <AvatarAddOn.Icon
                    className='fa fas fa-circle'
                    color='success'
                    key='avatar-icon-fg'
                  />,
                ]}
              />
            </Sidebar.HideSlim>
          </Link> */}

          <UncontrolledButtonDropdown>
            <DropdownToggle
              color='link'
              className='pl-0 pb-0 btn-profile sidebar__link'
            >
              {username}
              <i className='fas fa-angle-down ml-2'></i>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem header><strong>{name}</strong></DropdownItem>
              <DropdownItem header>
                <i className='fas fa-user-secret mr-2'></i> {roles && roles[0].replace(/_/g, ' ').replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() })}</DropdownItem>
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
          {/* <div className='small sidebar__link--muted'>{profile}</div> */}
        {/* </Sidebar.Section>
      </Sidebar.HideSlim> */}
      {/* END: Sidebar Default */}

      {/* START: Sidebar Slim */}
      {/* // <Sidebar.ShowSlim>
      //   <Sidebar.Section>
      //     <Avatar.Image
      //       size='sm'
      //       src={picture}
      //       addOns={[
      //         <AvatarAddOn.Icon
      //           className='fa fas fa-circle'
      //           color='white'
      //           key='avatar-icon-bg'
      //         />,
      //         <AvatarAddOn.Icon
      //           className='fa fas fa-circle'
      //           color='success'
      //           key='avatar-icon-fg'
      //         />,
      //       ]}
      //     />
      //   </Sidebar.Section>
      // </Sidebar.ShowSlim> */}
      {/* END: Sidebar Slim */}
    </React.Fragment>
  );
};

export { SidebarTopA };
