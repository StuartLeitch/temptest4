import { Money, SellerReceivableBreakdown } from '../money';
import { SellerProtection } from '../seller-protection';
import { DisbursementMode } from '../disbursement-mode';
import { PayPalLinkDescription } from '../link-description';

export enum PaymentStatus {
  PARTIALLY_REFUNDED = ' PARTIALLY_REFUNDED',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
  REFUNDED = 'REFUNDED',
  PENDING = 'PENDING',
}

export interface PayPalPaymentCapture {
  status: PaymentStatus;
  id: string;
  amount: Money;
  invoice_id: string;
  custom_id: string;
  seller_protection: SellerProtection;
  final_capture: boolean;
  seller_receivable_breakdown: SellerReceivableBreakdown;
  disbursement_mode: DisbursementMode;
  links: Array<PayPalLinkDescription>;
  create_time: string;
  update_time: string;
}
