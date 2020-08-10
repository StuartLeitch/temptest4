export enum SellerProtectionStatus {
  PARTIALLY_ELIGIBLE = 'PARTIALLY_ELIGIBLE',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ELIGIBLE = 'ELIGIBLE',
}

export enum DisputeCategory {
  UNAUTHORIZED_TRANSACTION = 'UNAUTHORIZED_TRANSACTION',
  ITEM_NOT_RECEIVED = 'ITEM_NOT_RECEIVED',
}

export interface SellerProtection {
  dispute_categories?: Array<DisputeCategory>;
  status?: SellerProtectionStatus;
}
