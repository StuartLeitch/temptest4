/**
 * * RBAC Interface
 */
export interface RoleBasedAccessControlContract {
  getUserRoles: (userId: string) => string[] | Error;
  removeUserRoles: (userId: string, role?: string[]) => void | Error;
  addUserRoles: (userId: string, role: string[]) => void | Error;
  isAllowed: (userId: string, permissionId: string) => boolean | Error;
  extendRole: (role: string, extendingRoles: string[]) => void | Error;
}
