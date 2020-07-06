import { PayPalLinkDescription as LinkDescription } from './link-description';
import { PayPalAddress as Address } from './address';

interface Money {
  currency_code: string;
  value: string;
}

interface AmountBreakdown {
  shipping_discount?: Money;
  item_total?: Money;
  tax_total?: Money;
  insurance?: Money;
  shipping?: Money;
  handling?: Money;
  discount?: Money;
}

interface AmountWithBreakdown extends Money {
  breakdown?: AmountBreakdown;
}

interface PayeeBase {
  email_address: string;
  merchant_id: string;
}

interface Payee {
  email_address: string;
  merchant_id: string;
}

enum DisbursementMode {
  INSTANT = 'INSTANT',
  DELAYED = 'DELAYED',
}

export enum ItemCategory {
  PHYSICAL_GOODS = 'PHYSICAL_GOODS',
  DIGITAL_GOODS = 'DIGITAL_GOODS',
}

interface PlatformFee {
  amount: Money;
  payee?: PayeeBase;
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

enum SellerProtectionStatus {
  PARTIALLY_ELIGIBLE = 'PARTIALLY_ELIGIBLE',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ELIGIBLE = 'ELIGIBLE',
}

enum DisputeCategory {
  UNAUTHORIZED_TRANSACTION = 'UNAUTHORIZED_TRANSACTION',
  ITEM_NOT_RECEIVED = 'ITEM_NOT_RECEIVED',
}

interface SellerProtection {
  dispute_categories?: Array<DisputeCategory>;
  status?: SellerProtectionStatus;
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

interface ExchangeRate {
  source_currency?: string;
  target_currency?: string;
  value?: string;
}

interface SellerReceivableBreakdown {
  gross_amount: Money;
  paypal_fee?: Money;
  net_amount?: Money;
  receivable_amount?: Money;
  exchange_rate?: ExchangeRate;
  platform_fees?: Array<PlatformFee>;
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
  amount: AmountWithBreakdown;
  reference_id?: string;
  description?: string;
  payee?: Payee;
  payment_instruction?: PaymentInstruction;
  custom_id?: string;
  invoice_id?: string;
  id?: string;
  soft_descriptor?: string;
  items?: Array<Item>;
  shipping?: ShippingDetail;
  payments?: Payment;
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
