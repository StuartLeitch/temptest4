import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { Breadcrumb } from '@hindawi/phenom-ui';

export const DefaultNavbar: React.FC = () => {
  const { pathname } = useLocation();
  const breadcrumbs = pathname.substring(1).split('/');

  const { Item } = Breadcrumb;

  return null
  //(
    // <Breadcrumb>
    //   {/* <Item>
    //     <Link to='/'>Dashboard</Link>
    //   </Item> */}
    //   {breadcrumbs.map((breadcrumb, index) => {
    //     let bc;
    //     const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    //     if (isUUID.test(breadcrumb)) {
    //       bc = breadcrumb;
    //     } else {
    //       bc = breadcrumb
    //         .replace('-', ' ')
    //         .replace(/\b(\w)/g, (c) => c.toUpperCase());
    //     }
    //     return <Item key={index}>{bc}</Item>;
    //   })}
    // </Breadcrumb>
  //);
};
