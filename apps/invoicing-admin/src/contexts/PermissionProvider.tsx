import React from 'react';
import {Permission} from "./PermissionTypes";
import PermissionContext from "./PermissionContext";
import { useAuth } from './Auth';

// type Props = {
//     fetchPermission: (p: Permission) => Promise<boolean>
// }

type PermissionCache = {
    [key:string]: boolean;
}

const PERMISSIONS = {
  SUPER_ADMIN: [
    'list.invoices',
    'list.credit-notes',
    'create.credit-note',
    'create.coupon',
    'list.coupons',
    'edit.coupon',
    'apply.coupon',
    'add.payment',
    'stop.reminders'
  ],
  ADMIN: [
    'list.invoices',
    'list.credit-notes',
    'create.credit-note',
    'create.coupon',
    'list.coupons',
    'edit.coupon',
    'apply.coupon',
    'add.payment',
    'stop.reminders'
  ],
  FINANCIAL_ADMIN: [
    'list.invoices',
    'list.credit-notes',
    'create.credit-note',
    'create.coupon',
    'list.coupons',
    'apply.coupon',
    'edit.coupon',
    'add.payment',
    'stop.reminders'
  ],
  FINANCIAL_CONTROLLER: [
    'list.invoices',
    'list.credit-notes',
    'create.credit-note',
    'apply.coupon',
    'add.payment'
  ],
  MARKETING: ['list.invoices','list.coupons', 'list.credit-notes', 'create.coupon', 'apply.coupon', 'edit.coupon'],
  FINANCIAL_SUPPORT: ['list.invoices', 'list.credit-notes', 'apply.coupon'],
}

// This provider is intended to be surrounding the whole application.
// It should receive the users permissions as parameter
const PermissionProvider: React.FunctionComponent<{}> = ({children}) => {
    const { data } = useAuth();

    // * Creates a method that returns whether the requested permission is available in the list of permissions
    // * passed as parameter
    const isAllowedTo = async (permission: Permission): Promise<boolean> => {
      let permissions = [];

      permissions = [...new Set(data.roles.reduce((permissions, role) => {
        const assignedRole = role.toUpperCase();
        let permissionsByRole = PERMISSIONS[assignedRole];

        return permissions.concat(permissionsByRole);
        }, []))];

      return permissions.includes(permission);

    };

    // This component will render its children wrapped around a PermissionContext's provider whose
    // value is set to the method defined above
    return <PermissionContext.Provider value={{isAllowedTo}}>{children}</PermissionContext.Provider>;
};

export default PermissionProvider;
