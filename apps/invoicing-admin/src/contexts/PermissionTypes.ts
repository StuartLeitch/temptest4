export type Permission = string;

export type User = {
  firstName: string;
  lastName: string;
  permissions: Permission[];
};
