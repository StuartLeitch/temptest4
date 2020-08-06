import { PayPalLinkDescription as LinkDescription } from './link-description';
import { DisbursementMode } from './disbursement-mode';
import { SellerProtection } from './seller-protection';
import { PayPalAddress as Address } from './address';
import { ExchangeRate } from './exchange-rate';
import {
  SellerReceivableBreakdown,
  AmountWithBreakdown,
  PlatformFee,
  Money,
} from './money';

interface Payee {
  email_address: string;
  merchant_id: string;
}

export enum ItemCategory {
  PHYSICAL_GOODS = 'PHYSICAL_GOODS',
  DIGITAL_GOODS = 'DIGITAL_GOODS',
}

interface PaymentInstruction {
  platform_fees?: PlatformFee;
  disbursement_mode?: DisbursementMode;
}

interface ShippingDetail {
  name?: { full_name?: string };
  address?: Address;
}

interface Item {
  category?: ItemCategory;
  description?: string;
  unit_amount: Money;
  quantity: string;
  name: string;
  sku?: string;
  tax?: Money;
}

enum AuthorizationStatus {
  PARTIALLY_CAPTURED = 'PARTIALLY_CAPTURED',
  PARTIALLY_CREATED = 'PARTIALLY_CREATED',
  CAPTURED = 'CAPTURED',
  CREATED = 'CREATED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  DENIED = 'DENIED',
  VOIDED = 'VOIDED',
}

enum AuthorizationReason {
  PENDING_REVIEW = 'PENDING_REVIEW',
}

interface AuthorizationWithData {
  status?: AuthorizationStatus;
  status_details?: { reason?: AuthorizationReason };
  id?: string;
  amount?: Money;
  invoice_id?: string;
  custom_id?: string;
  seller_protection?: SellerProtection;
  expiration_time?: string;
  links?: Array<LinkDescription>;
  create_time?: string;
  update_time?: string;
}

enum CaptureStatus {
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
  REFUNDED = 'REFUNDED',
  PENDING = 'PENDING',
}

enum CaptureStatusDetails {
  RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION = 'RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION',
  TRANSACTION_APPROVED_AWAITING_FUNDING = 'TRANSACTION_APPROVED_AWAITING_FUNDING',
  INTERNATIONAL_WITHDRAWAL = 'INTERNATIONAL_WITHDRAWAL',
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
  BUYER_COMPLAINT = 'BUYER_COMPLAINT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  CHARGEBACK = 'CHARGEBACK',
  UNILATERAL = 'UNILATERAL',
  REFUNDED = 'REFUNDED',
  ECHECK = 'ECHECK',
  OTHER = 'OTHER',
}

interface Capture {
  status?: CaptureStatus;
  status_details?: CaptureStatusDetails;
  id?: string;
  amount?: Money;
  invoice_id?: string;
  custom_id?: string;
  seller_protection?: SellerProtection;
  final_capture?: boolean;
  seller_receivable_breakdown?: SellerReceivableBreakdown;
  disbursement_mode?: DisbursementMode;
  links?: Array<LinkDescription>;
  supplementary_data?: Record<string, unknown>;
  created_time?: string;
  update_time?: string;
}

enum RefundStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

enum RefundStatusDetails {
  ECHECK = 'ECHECK',
}

interface NetAmountBreakdown {
  payable_amount?: Money;
  converted_amount?: Money;
  exchange_rate?: ExchangeRate;
}

interface SellerPayableBreakdown {
  gross_amount: Money;
  paypal_fee?: Money;
  net_amount?: Money;
  platform_fees?: Array<PlatformFee>;
  net_amount_breakdown?: Array<NetAmountBreakdown>;
  total_refunded_amount?: Money;
}

interface Refund {
  status: RefundStatus;
  status_details?: RefundStatusDetails;
  id?: string;
  amount?: Money;
  invoice_id?: string;
  note_to_payer?: string;
  seller_payable_breakdown?: SellerPayableBreakdown;
  links?: Array<LinkDescription>;
  create_time?: string;
  update_time?: string;
}

interface Payment {
  authorizations: Array<AuthorizationWithData>;
  captures: Array<Capture>;
  refunds: Array<Refund>;
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  amount: AmountWithBreakdown;
  description?: string;
  payee: Payee;
  payment_instruction: PaymentInstruction;
  custom_id: string;
  invoice_id: string;
  id: string;
  soft_descriptor?: string;
  items: Array<Item>;
  shipping?: ShippingDetail;
  payments: Payment;
}

export interface PayPalPurchaseUnitRequest {
  reference_id?: string;
  amount: AmountWithBreakdown;
  payee?: Payee;
  payment_instructions?: PaymentInstruction;
  description?: string;
  custom_id?: string;
  invoice_id?: string;
  soft_descriptor?: string;
  items?: Array<Item>;
  shipping?: ShippingDetail;
}
