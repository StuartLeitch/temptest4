export interface AccessControlContext {
  userId?: string;
  userTenantId?: string;
  entityOwnerId?: string;
  entityTenantId?: string;
  paymentType?: string;
}
