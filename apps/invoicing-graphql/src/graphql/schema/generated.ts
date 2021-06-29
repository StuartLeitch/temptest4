import { PaginatedCreditNoteResult } from '@hindawi/shared';
import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  ReferenceNumber: any;
  Name: any;
};

export type Error = {
  __typename?: 'Error';
  error?: Maybe<Scalars['String']>;
};

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FINAL = 'FINAL',
}

export type Article = {
  __typename?: 'Article';
  id?: Maybe<Scalars['String']>;
  journalId?: Maybe<Scalars['ID']>;
  journalTitle?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['ID']>;
  created?: Maybe<Scalars['Date']>;
  title?: Maybe<Scalars['String']>;
  articleType?: Maybe<Scalars['String']>;
  authorEmail?: Maybe<Scalars['String']>;
  authorCountry?: Maybe<Scalars['String']>;
  authorSurname?: Maybe<Scalars['String']>;
  authorFirstName?: Maybe<Scalars['String']>;
  datePublished?: Maybe<Scalars['Date']>;
  preprintValue?: Maybe<Scalars['String']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
};

export type ErpReference = {
  __typename?: 'ErpReference';
  entity_id?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  vendor?: Maybe<Scalars['String']>;
  attribute?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FINAL = 'FINAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
}

// export enum CreationReason {
//   WITHDRAWN_MANUSCRIPT = 'withdrawn-manuscript',
//   REDUCTION_APPLIED = 'reduction-applied',
//   WAIVED_MANUSCRIPT = 'waived-manuscript',
//   CHANGED_PAYER_DETAILS = 'changed-payer-details',
//   BAD_DEBT = 'bad-debt',
//   OTHER = 'other',
// }
export type InvoiceItem = {
  __typename?: 'InvoiceItem';
  id?: Maybe<Scalars['String']>;
  invoiceId?: Maybe<Scalars['ID']>;
  manuscriptId?: Maybe<Scalars['ID']>;
  type?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  vat?: Maybe<Scalars['Float']>;
  vatnote?: Maybe<Scalars['String']>;
  article?: Maybe<Article>;
  dateCreated?: Maybe<Scalars['Date']>;
  coupons?: Maybe<Array<Maybe<Coupon>>>;
  waivers?: Maybe<Array<Maybe<Waiver>>>;
};

export type Invoice = {
  __typename?: 'Invoice';
  invoiceId?: Maybe<Scalars['ID']>;
  dateCreated?: Maybe<Scalars['String']>;
  dateChanged?: Maybe<Scalars['String']>;
  dateIssued?: Maybe<Scalars['String']>;
  dateAccepted?: Maybe<Scalars['String']>;
  dateMovedToFinal?: Maybe<Scalars['String']>;
  vat?: Maybe<Scalars['Float']>;
  charge?: Maybe<Scalars['Float']>;
  status?: Maybe<InvoiceStatus>;
  payer?: Maybe<Payer>;
  erpReference?: Maybe<Scalars['String']>;
  erpReferences?: Maybe<Array<Maybe<ErpReference>>>;
  revenueRecognitionReference?: Maybe<Scalars['String']>;
  creationReason?: Maybe<Scalars['String']>;
  referenceNumber?: Maybe<Scalars['ReferenceNumber']>;
  cancelledInvoiceReference?: Maybe<Scalars['ID']>;
  invoiceItem?: Maybe<InvoiceItem>;
  title?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  customId?: Maybe<Scalars['ID']>;
  type?: Maybe<Scalars['String']>;
  payment?: Maybe<Payment>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  creditNote?: Maybe<CreditNote>;
  transaction?: Maybe<Transaction>;
};

export type InvoiceVat = {
  __typename?: 'InvoiceVat';
  vatPercentage?: Maybe<Scalars['Float']>;
  vatNote?: Maybe<Scalars['String']>;
  rate?: Maybe<Scalars['Float']>;
};

export type InvoiceId = {
  __typename?: 'InvoiceId';
  invoiceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type AddressInput = {
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  addressLine1?: Maybe<Scalars['String']>;
};

export type PayerInput = {
  id?: Maybe<Scalars['String']>;
  invoiceId?: Maybe<Scalars['String']>;
  type?: Maybe<PayerType>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  vatId?: Maybe<Scalars['String']>;
  address?: Maybe<AddressInput>;
};

export type Journal = {
  __typename?: 'Journal';
  journalId?: Maybe<Scalars['ID']>;
  journalTitle?: Maybe<Scalars['String']>;
};

export enum PayerType {
  INSTITUTION = 'INSTITUTION',
  INDIVIDUAL = 'INDIVIDUAL',
}

export type Payer = {
  __typename?: 'Payer';
  id?: Maybe<Scalars['String']>;
  type?: Maybe<PayerType>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  address?: Maybe<Address>;
  vatId?: Maybe<Scalars['String']>;
};

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  addressLine1?: Maybe<Scalars['String']>;
};

export type CreditCardInput = {
  amount: Scalars['Float'];
  cardNumber: Scalars['String'];
  expiration: Scalars['String'];
  cvv: Scalars['String'];
  postalCode?: Maybe<Scalars['String']>;
};

export type Payment = {
  __typename?: 'Payment';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<PaymentStatus>;
  invoiceId?: Maybe<Scalars['String']>;
  payerId?: Maybe<Scalars['String']>;
  paymentMethodId?: Maybe<Scalars['String']>;
  foreignPaymentId?: Maybe<Scalars['String']>;
  paymentProof?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  datePaid?: Maybe<Scalars['Date']>;
  paymentMethod?: Maybe<PaymentMethod>;
};

export type PayPalOrderId = {
  __typename?: 'PayPalOrderId';
  id: Scalars['String'];
};

// export type CreditNote = {
//   __typename?: 'CreditNote';
//   id: Scalars['String'];
//   cancelledInvoiceReference: Scalars['ID'];
// };

export type CreditNote = {
  __typename?: 'CreditNote';
  id: Maybe<Scalars['String']>;
  invoiceId: Maybe<Scalars['ID']>;
  creationReason: Maybe<Scalars['String']>;
  vat: Maybe<Scalars['Float']>;
  price: Maybe<Scalars['Float']>;
  persistentReferenceNumber?: Maybe<Scalars['ReferenceNumber']>;
  dateCreated?: Maybe<Scalars['Date']>;
  dateIssued?: Maybe<Scalars['Date']>;
  dateUpdated?: Maybe<Scalars['Date']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  id: Scalars['String'];
  name: Scalars['String'];
  isActive?: Maybe<Scalars['Boolean']>;
};

export type Coupon = {
  __typename?: 'Coupon';
  id?: Maybe<Scalars['ID']>;
  reduction?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  dateCreated?: Maybe<Scalars['Date']>;
  dateUpdated?: Maybe<Scalars['Date']>;
  expirationDate?: Maybe<Scalars['Date']>;
  invoiceItemType?: Maybe<Scalars['String']>;
  redeemCount?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type CouponCode = {
  __typename?: 'CouponCode';
  code?: Maybe<Scalars['String']>;
};

export type CouponInput = {
  id?: Maybe<Scalars['ID']>;
  reduction?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
  expirationDate?: Maybe<Scalars['Date']>;
  status?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  invoiceItemType?: Maybe<Scalars['String']>;
};

export type Waiver = {
  __typename?: 'Waiver';
  reduction?: Maybe<Scalars['Float']>;
  type_id?: Maybe<Scalars['String']>;
};

export type ClientToken = {
  __typename?: 'ClientToken';
  token: Scalars['String'];
};

export type PaginatedInvoices = {
  __typename?: 'PaginatedInvoices';
  totalCount?: Maybe<Scalars['Int']>;
  invoices?: Maybe<Array<Maybe<Invoice>>>;
};

export type PaginatedCoupons = {
  __typename?: 'PaginatedCoupons';
  totalCount?: Maybe<Scalars['Int']>;
  coupons?: Maybe<Array<Maybe<Coupon>>>;
};

export type PaginatedCreditNotes = {
  __typename?: 'PaginatedCreditNotes';
  totalCount?: Maybe<Scalars['Int']>;
  creditNotes?: Maybe<Array<Maybe<CreditNote>>>;
};

export type RemindersStatus = {
  __typename?: 'RemindersStatus';
  confirmation?: Maybe<Scalars['Boolean']>;
  payment?: Maybe<Scalars['Boolean']>;
};

export enum ReminderType {
  REMINDER_CONFIRMATION = 'REMINDER_CONFIRMATION',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY',
  REMINDER_PAYMENT = 'REMINDER_PAYMENT',
  INVOICE_CREATED = 'INVOICE_CREATED',
}

export type SentReminder = {
  __typename?: 'SentReminder';
  forInvoice?: Maybe<Scalars['ID']>;
  type?: Maybe<ReminderType>;
  toEmail?: Maybe<Scalars['String']>;
  when?: Maybe<Scalars['Date']>;
};

export type ArticleFilters = {
  journalId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  customId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type InvoiceItemFilters = {
  article?: Maybe<ArticleFilters>;
};

export type InvoiceFilters = {
  invoiceStatus?: Maybe<Array<Maybe<InvoiceStatus>>>;
  transactionStatus?: Maybe<Array<Maybe<TransactionStatus>>>;
  referenceNumber?: Maybe<Array<Maybe<Scalars['ReferenceNumber']>>>;
  invoiceItem?: Maybe<InvoiceItemFilters>;
};

export type Pagination = {
  page?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type MigratePayerAddress = {
  addressLine2?: Maybe<Scalars['String']>;
  addressLine1: Scalars['String'];
  countryCode: Scalars['String'];
  state?: Maybe<Scalars['String']>;
  city: Scalars['String'];
};

export type MigratePayer = {
  vatRegistrationNumber?: Maybe<Scalars['String']>;
  address: MigratePayerAddress;
  organization?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
};

export type MigrateApc = {
  invoiceReference?: Maybe<Scalars['String']>;
  paymentAmount?: Maybe<Scalars['Float']>;
  manuscriptId: Scalars['String'];
  discount?: Maybe<Scalars['Float']>;
  price: Scalars['Float'];
  vat?: Maybe<Scalars['Float']>;
};

export type Query = {
  __typename?: 'Query';
  getCreditNoteByInvoiceId?: Maybe<CreditNote>;
  getCreditNoteById?: Maybe<CreditNote>;
  getRecentCreditNotes?: Maybe<PaginatedCreditNotes>;
  getCreditNoteByReferenceNumber?: Maybe<CreditNote>;
  getPaymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  getClientToken?: Maybe<ClientToken>;
  generateCouponCode?: Maybe<CouponCode>;
  invoice?: Maybe<Invoice>;
  invoiceVat?: Maybe<InvoiceVat>;
  invoices?: Maybe<PaginatedInvoices>;
  coupon?: Maybe<Coupon>;
  coupons?: Maybe<PaginatedCoupons>;
  invoiceIdByManuscriptCustomId?: Maybe<InvoiceId>;
  journals?: Maybe<Array<Maybe<Journal>>>;
  echo?: Maybe<Scalars['String']>;
  remindersStatus?: Maybe<RemindersStatus>;
  remindersSent?: Maybe<Array<Maybe<SentReminder>>>;
};

export type QueryInvoiceArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
};

export type QueryCreditNoteByIdArgs = {
  creditNoteId?: Maybe<Scalars['ID']>;
};

export type QueryCreditNoteByInvoiceIdArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
};

export type QueryRecentCreditNotesArgs = {
  filters?: Maybe<InvoiceFilters>;
  pagination?: Maybe<Pagination>;
};

export type QueryCreditNoteByReferenceNumberArgs = {
  referenceNumber?: Maybe<Scalars['String']>;
};

export type QueryInvoiceVatArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  payerType?: Maybe<Scalars['String']>;
};

export type QueryInvoicesArgs = {
  filters?: Maybe<InvoiceFilters>;
  pagination?: Maybe<Pagination>;
};

export type QueryCouponArgs = {
  couponCode: Scalars['String'];
};

export type QueryCouponsArgs = {
  pagination?: Maybe<Pagination>;
};

export type QueryInvoiceIdByManuscriptCustomIdArgs = {
  customId?: Maybe<Scalars['ID']>;
};

export type QueryEchoArgs = {
  value?: Maybe<Scalars['String']>;
};

export type QueryRemindersStatusArgs = {
  invoiceId: Scalars['ID'];
};

export type QueryRemindersSentArgs = {
  invoiceId: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  confirmInvoice: Payer;
  applyCoupon?: Maybe<Coupon>;
  updateCoupon?: Maybe<Coupon>;
  createCoupon?: Maybe<Coupon>;
  createInvoice?: Maybe<Invoice>;
  deleteInvoice?: Maybe<Scalars['Boolean']>;
  setTransactionToActive?: Maybe<Transaction>;
  creditCardPayment: Payment;
  bankTransferPayment: Payment;
  createCreditNote: CreditNote;
  createPayPalOrder: PayPalOrderId;
  recordPayPalPayment: Scalars['ID'];
  migrateEntireInvoice?: Maybe<Scalars['String']>;
  generateCompensatoryEvents?: Maybe<Scalars['String']>;
  generateDraftCompensatoryEvents?: Maybe<Scalars['String']>;
  togglePauseConfirmationReminders?: Maybe<RemindersStatus>;
  togglePausePaymentReminders?: Maybe<RemindersStatus>;
  generateMissingReminderJobs: Scalars['String'];
};

export type MutationConfirmInvoiceArgs = {
  payer: PayerInput;
};

export type MutationApplyCouponArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
  couponCode?: Maybe<Scalars['String']>;
};

export type MutationUpdateCouponArgs = {
  coupon?: Maybe<CouponInput>;
};

export type MutationCreateCouponArgs = {
  coupon?: Maybe<CouponInput>;
};

export type MutationCreateInvoiceArgs = {
  totalAmount?: Maybe<Scalars['Float']>;
};

export type MutationDeleteInvoiceArgs = {
  id: Scalars['ID'];
};

export type MutationSetTransactionToActiveArgs = {
  customId?: Maybe<Scalars['ID']>;
};

export type MutationCreditCardPaymentArgs = {
  invoiceId: Scalars['ID'];
  payerId: Scalars['String'];
  paymentMethodId: Scalars['String'];
  paymentMethodNonce: Scalars['String'];
  amount: Scalars['Float'];
};

export type MutationBankTransferPaymentArgs = {
  invoiceId: Scalars['String'];
  payerId: Scalars['String'];
  paymentMethodId: Scalars['String'];
  paymentReference: Scalars['String'];
  amount: Scalars['Float'];
  datePaid: Scalars['String'];
  markInvoiceAsPaid?: Maybe<Scalars['Boolean']>;
};

export type MutationCreateCreditNoteArgs = {
  invoiceId: Scalars['String'];
  createDraft?: Maybe<Scalars['Boolean']>;
  reason?: Maybe<Scalars['String']>;
};

export type MutationCreatePayPalOrderArgs = {
  invoiceId: Scalars['ID'];
};

export type MutationRecordPayPalPaymentArgs = {
  invoiceId: Scalars['ID'];
  orderId: Scalars['ID'];
};

export type MutationMigrateEntireInvoiceArgs = {
  acceptanceDate?: Maybe<Scalars['String']>;
  submissionDate: Scalars['String'];
  paymentDate?: Maybe<Scalars['String']>;
  issueDate?: Maybe<Scalars['String']>;
  revenueRecognitionReference?: Maybe<Scalars['String']>;
  erpReference?: Maybe<Scalars['String']>;
  payer?: Maybe<MigratePayer>;
  invoiceId: Scalars['String'];
  apc: MigrateApc;
  token: Scalars['String'];
  status: Scalars['String'];
};

export type MutationGenerateCompensatoryEventsArgs = {
  invoiceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  journalIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type MutationGenerateDraftCompensatoryEventsArgs = {
  invoiceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  journalIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type MutationTogglePauseConfirmationRemindersArgs = {
  invoiceId: Scalars['ID'];
  state: Scalars['Boolean'];
};

export type MutationTogglePausePaymentRemindersArgs = {
  invoiceId: Scalars['ID'];
  state: Scalars['Boolean'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Date: ResolverTypeWrapper<Scalars['Date']>;
  ReferenceNumber: ResolverTypeWrapper<Scalars['ReferenceNumber']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Name: ResolverTypeWrapper<Scalars['Name']>;
  Error: ResolverTypeWrapper<Error>;
  String: ResolverTypeWrapper<Scalars['String']>;
  InvoiceStatus: InvoiceStatus;
  Article: ResolverTypeWrapper<Article>;
  Transaction: ResolverTypeWrapper<Transaction>;
  ErpReference: ResolverTypeWrapper<ErpReference>;
  TransactionStatus: TransactionStatus;
  PaymentStatus: PaymentStatus;
  // CreationReason: CreationReason;
  InvoiceItem: ResolverTypeWrapper<InvoiceItem>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Invoice: ResolverTypeWrapper<Invoice>;
  InvoiceVat: ResolverTypeWrapper<InvoiceVat>;
  InvoiceId: ResolverTypeWrapper<InvoiceId>;
  AddressInput: AddressInput;
  PayerInput: PayerInput;
  Journal: ResolverTypeWrapper<Journal>;
  PayerType: PayerType;
  Payer: ResolverTypeWrapper<Payer>;
  Address: ResolverTypeWrapper<Address>;
  CreditCardInput: CreditCardInput;
  Payment: ResolverTypeWrapper<Payment>;
  PayPalOrderId: ResolverTypeWrapper<PayPalOrderId>;
  CreditNote: ResolverTypeWrapper<CreditNote>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Coupon: ResolverTypeWrapper<Coupon>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  CouponCode: ResolverTypeWrapper<CouponCode>;
  CouponInput: CouponInput;
  Waiver: ResolverTypeWrapper<Waiver>;
  ClientToken: ResolverTypeWrapper<ClientToken>;
  PaginatedInvoices: ResolverTypeWrapper<PaginatedInvoices>;
  PaginatedCoupons: ResolverTypeWrapper<PaginatedCoupons>;
  PaginatedCreditNotes: ResolverTypeWrapper<PaginatedCreditNotes>;
  RemindersStatus: ResolverTypeWrapper<RemindersStatus>;
  ReminderType: ReminderType;
  SentReminder: ResolverTypeWrapper<SentReminder>;
  ArticleFilters: ArticleFilters;
  InvoiceItemFilters: InvoiceItemFilters;
  InvoiceFilters: InvoiceFilters;
  Pagination: Pagination;
  MigratePayerAddress: MigratePayerAddress;
  MigratePayer: MigratePayer;
  MigrateAPC: MigrateApc;
  Query: ResolverTypeWrapper<{}>;
  Mutation: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Date: Scalars['Date'];
  ReferenceNumber: Scalars['ReferenceNumber'];
  ID: Scalars['ID'];
  Name: Scalars['Name'];
  Error: Error;
  String: Scalars['String'];
  Article: Article;
  Transaction: Transaction;
  ErpReference: ErpReference;
  InvoiceItem: InvoiceItem;
  Float: Scalars['Float'];
  Invoice: Invoice;
  InvoiceVat: InvoiceVat;
  InvoiceId: InvoiceId;
  AddressInput: AddressInput;
  PayerInput: PayerInput;
  Journal: Journal;
  Payer: Payer;
  Address: Address;
  CreditCardInput: CreditCardInput;
  Payment: Payment;
  PayPalOrderId: PayPalOrderId;
  CreditNote: CreditNote;
  PaymentMethod: PaymentMethod;
  Boolean: Scalars['Boolean'];
  Coupon: Coupon;
  Int: Scalars['Int'];
  CouponCode: CouponCode;
  CouponInput: CouponInput;
  Waiver: Waiver;
  ClientToken: ClientToken;
  PaginatedInvoices: PaginatedInvoices;
  PaginatedCoupons: PaginatedCoupons;
  PaginatedCreditNotes: PaginatedCreditNotes;
  RemindersStatus: RemindersStatus;
  SentReminder: SentReminder;
  ArticleFilters: ArticleFilters;
  InvoiceItemFilters: InvoiceItemFilters;
  InvoiceFilters: InvoiceFilters;
  Pagination: Pagination;
  MigratePayerAddress: MigratePayerAddress;
  MigratePayer: MigratePayer;
  MigrateAPC: MigrateApc;
  Query: {};
  Mutation: {};
};

export type ModelDirectiveArgs = { id?: Maybe<Scalars['ID']> };

export type ModelDirectiveResolver<
  Result,
  Parent,
  ContextType = any,
  Args = ModelDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type FilterDirectiveArgs = { key?: Maybe<Scalars['Name']> };

export type FilterDirectiveResolver<
  Result,
  Parent,
  ContextType = any,
  Args = FilterDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface DateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface ReferenceNumberScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['ReferenceNumber'], any> {
  name: 'ReferenceNumber';
}

export interface NameScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Name'], any> {
  name: 'Name';
}

export type ErrorResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']
> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']
> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  journalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  journalTitle?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  customId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  articleType?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  authorEmail?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  authorCountry?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  authorSurname?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  authorFirstName?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  datePublished?: Resolver<
    Maybe<ResolversTypes['Date']>,
    ParentType,
    ContextType
  >;
  preprintValue?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransactionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']
> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErpReferenceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ErpReference'] = ResolversParentTypes['ErpReference']
> = {
  entity_id?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attribute?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceItemResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['InvoiceItem'] = ResolversParentTypes['InvoiceItem']
> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  manuscriptId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vatnote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  dateCreated?: Resolver<
    Maybe<ResolversTypes['Date']>,
    ParentType,
    ContextType
  >;
  coupons?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Coupon']>>>,
    ParentType,
    ContextType
  >;
  waivers?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Waiver']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']
> = {
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  dateCreated?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  dateChanged?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  dateIssued?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  dateAccepted?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  dateMovedToFinal?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  charge?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<
    Maybe<ResolversTypes['InvoiceStatus']>,
    ParentType,
    ContextType
  >;
  payer?: Resolver<Maybe<ResolversTypes['Payer']>, ParentType, ContextType>;
  erpReference?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  erpReferences?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['ErpReference']>>>,
    ParentType,
    ContextType
  >;
  revenueRecognitionReference?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  creationReason?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  referenceNumber?: Resolver<
    Maybe<ResolversTypes['ReferenceNumber']>,
    ParentType,
    ContextType
  >;
  cancelledInvoiceReference?: Resolver<
    Maybe<ResolversTypes['ID']>,
    ParentType,
    ContextType
  >;
  invoiceItem?: Resolver<
    Maybe<ResolversTypes['InvoiceItem']>,
    ParentType,
    ContextType
  >;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  customId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType>;
  payments?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Payment']>>>,
    ParentType,
    ContextType
  >;
  // creditNote?: Resolver<
  //   Maybe<ResolversTypes['Invoice']>,
  //   ParentType,
  //   ContextType
  // >;
  creditNote?: Resolver<
    Maybe<ResolversTypes['CreditNote']>,
    ParentType,
    ContextType,
    RequireFields<QueryInvoiceArgs, never>
  >;
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceVatResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['InvoiceVat'] = ResolversParentTypes['InvoiceVat']
> = {
  vatPercentage?: Resolver<
    Maybe<ResolversTypes['Float']>,
    ParentType,
    ContextType
  >;
  vatNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceIdResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['InvoiceId'] = ResolversParentTypes['InvoiceId']
> = {
  invoiceId?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['ID']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JournalResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Journal'] = ResolversParentTypes['Journal']
> = {
  journalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  journalTitle?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PayerResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Payer'] = ResolversParentTypes['Payer']
> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['PayerType']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organization?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  address?: Resolver<Maybe<ResolversTypes['Address']>, ParentType, ContextType>;
  vatId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddressResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']
> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalCode?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  addressLine1?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Payment'] = ResolversParentTypes['Payment']
> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<
    Maybe<ResolversTypes['PaymentStatus']>,
    ParentType,
    ContextType
  >;
  invoiceId?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  payerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethodId?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  foreignPaymentId?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  paymentProof?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  datePaid?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  paymentMethod?: Resolver<
    Maybe<ResolversTypes['PaymentMethod']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PayPalOrderIdResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PayPalOrderId'] = ResolversParentTypes['PayPalOrderId']
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

// export type CreditNoteResolvers<
//   ContextType = any,
//   ParentType extends ResolversParentTypes['CreditNote'] = ResolversParentTypes['CreditNote']
// > = {
//   id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
//   cancelledInvoiceReference?: Resolver<
//     ResolversTypes['ID'],
//     ParentType,
//     ContextType
//   >;
//   __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
// };

export type CreditNoteResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['CreditNote'] = ResolversParentTypes['CreditNote']
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  invoiceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  creationReason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  persistentReferenceNumber?: Resolver<
    ResolversTypes['ReferenceNumber'],
    ParentType,
    ContextType
  >;
  dateCreated?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateIssued?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dateUpdated?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  erpReference?: Resolver<
    ResolversTypes['ErpReference'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isActive?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Coupon'] = ResolversParentTypes['Coupon']
> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  reduction?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<
    Maybe<ResolversTypes['Date']>,
    ParentType,
    ContextType
  >;
  dateUpdated?: Resolver<
    Maybe<ResolversTypes['Date']>,
    ParentType,
    ContextType
  >;
  expirationDate?: Resolver<
    Maybe<ResolversTypes['Date']>,
    ParentType,
    ContextType
  >;
  invoiceItemType?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  redeemCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponCodeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['CouponCode'] = ResolversParentTypes['CouponCode']
> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WaiverResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Waiver'] = ResolversParentTypes['Waiver']
> = {
  reduction?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientTokenResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ClientToken'] = ResolversParentTypes['ClientToken']
> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedInvoicesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PaginatedInvoices'] = ResolversParentTypes['PaginatedInvoices']
> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invoices?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Invoice']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCouponsResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PaginatedCoupons'] = ResolversParentTypes['PaginatedCoupons']
> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  coupons?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Coupon']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCreditNotesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PaginatedCreditNotes'] = ResolversParentTypes['PaginatedCreditNotes']
> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  coupons?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['CreditNote']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RemindersStatusResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['RemindersStatus'] = ResolversParentTypes['RemindersStatus']
> = {
  confirmation?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  payment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SentReminderResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SentReminder'] = ResolversParentTypes['SentReminder']
> = {
  forInvoice?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<
    Maybe<ResolversTypes['ReminderType']>,
    ParentType,
    ContextType
  >;
  toEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  when?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  getCreditNoteByInvoiceId?: Resolver<
    Maybe<ResolversTypes['CreditNote']>,
    ParentType,
    ContextType,
    RequireFields<QueryCreditNoteByInvoiceIdArgs, never>
  >;
  getCreditNoteById?: Resolver<
    Maybe<ResolversTypes['CreditNote']>,
    ParentType,
    ContextType,
    RequireFields<QueryCreditNoteByIdArgs, never>
  >;
  getRecentCreditNotes?: Resolver<
    Maybe<ResolversTypes['PaginatedCreditNotes']>,
    ParentType,
    ContextType,
    RequireFields<QueryRecentCreditNotesArgs, never>
  >;
  getCreditNoteByReferenceNumber?: Resolver<
    Maybe<ResolversTypes['CreditNote']>,
    ParentType,
    ContextType,
    RequireFields<QueryCreditNoteByReferenceNumberArgs, never>
  >;
  getPaymentMethods?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['PaymentMethod']>>>,
    ParentType,
    ContextType
  >;
  getClientToken?: Resolver<
    Maybe<ResolversTypes['ClientToken']>,
    ParentType,
    ContextType
  >;
  generateCouponCode?: Resolver<
    Maybe<ResolversTypes['CouponCode']>,
    ParentType,
    ContextType
  >;
  invoice?: Resolver<
    Maybe<ResolversTypes['Invoice']>,
    ParentType,
    ContextType,
    RequireFields<QueryInvoiceArgs, never>
  >;
  invoiceVat?: Resolver<
    Maybe<ResolversTypes['InvoiceVat']>,
    ParentType,
    ContextType,
    RequireFields<QueryInvoiceVatArgs, never>
  >;
  invoices?: Resolver<
    Maybe<ResolversTypes['PaginatedInvoices']>,
    ParentType,
    ContextType,
    RequireFields<QueryInvoicesArgs, never>
  >;
  coupon?: Resolver<
    Maybe<ResolversTypes['Coupon']>,
    ParentType,
    ContextType,
    RequireFields<QueryCouponArgs, 'couponCode'>
  >;
  coupons?: Resolver<
    Maybe<ResolversTypes['PaginatedCoupons']>,
    ParentType,
    ContextType,
    RequireFields<QueryCouponsArgs, never>
  >;
  invoiceIdByManuscriptCustomId?: Resolver<
    Maybe<ResolversTypes['InvoiceId']>,
    ParentType,
    ContextType,
    RequireFields<QueryInvoiceIdByManuscriptCustomIdArgs, never>
  >;
  journals?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Journal']>>>,
    ParentType,
    ContextType
  >;
  echo?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<QueryEchoArgs, never>
  >;
  remindersStatus?: Resolver<
    Maybe<ResolversTypes['RemindersStatus']>,
    ParentType,
    ContextType,
    RequireFields<QueryRemindersStatusArgs, 'invoiceId'>
  >;
  remindersSent?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['SentReminder']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryRemindersSentArgs, 'invoiceId'>
  >;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  confirmInvoice?: Resolver<
    ResolversTypes['Payer'],
    ParentType,
    ContextType,
    RequireFields<MutationConfirmInvoiceArgs, 'payer'>
  >;
  applyCoupon?: Resolver<
    Maybe<ResolversTypes['Coupon']>,
    ParentType,
    ContextType,
    RequireFields<MutationApplyCouponArgs, never>
  >;
  updateCoupon?: Resolver<
    Maybe<ResolversTypes['Coupon']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCouponArgs, never>
  >;
  createCoupon?: Resolver<
    Maybe<ResolversTypes['Coupon']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateCouponArgs, never>
  >;
  createInvoice?: Resolver<
    Maybe<ResolversTypes['Invoice']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateInvoiceArgs, never>
  >;
  deleteInvoice?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteInvoiceArgs, 'id'>
  >;
  setTransactionToActive?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType,
    RequireFields<MutationSetTransactionToActiveArgs, never>
  >;
  creditCardPayment?: Resolver<
    ResolversTypes['Payment'],
    ParentType,
    ContextType,
    RequireFields<
      MutationCreditCardPaymentArgs,
      | 'invoiceId'
      | 'payerId'
      | 'paymentMethodId'
      | 'paymentMethodNonce'
      | 'amount'
    >
  >;
  bankTransferPayment?: Resolver<
    ResolversTypes['Payment'],
    ParentType,
    ContextType,
    RequireFields<
      MutationBankTransferPaymentArgs,
      | 'invoiceId'
      | 'payerId'
      | 'paymentMethodId'
      | 'paymentReference'
      | 'amount'
      | 'datePaid'
    >
  >;
  createCreditNote?: Resolver<
    ResolversTypes['CreditNote'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateCreditNoteArgs, 'invoiceId'>
  >;
  createPayPalOrder?: Resolver<
    ResolversTypes['PayPalOrderId'],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePayPalOrderArgs, 'invoiceId'>
  >;
  recordPayPalPayment?: Resolver<
    ResolversTypes['ID'],
    ParentType,
    ContextType,
    RequireFields<MutationRecordPayPalPaymentArgs, 'invoiceId' | 'orderId'>
  >;
  migrateEntireInvoice?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<
      MutationMigrateEntireInvoiceArgs,
      'submissionDate' | 'invoiceId' | 'apc' | 'token' | 'status'
    >
  >;
  generateCompensatoryEvents?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<MutationGenerateCompensatoryEventsArgs, never>
  >;
  generateDraftCompensatoryEvents?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<MutationGenerateDraftCompensatoryEventsArgs, never>
  >;
  togglePauseConfirmationReminders?: Resolver<
    Maybe<ResolversTypes['RemindersStatus']>,
    ParentType,
    ContextType,
    RequireFields<
      MutationTogglePauseConfirmationRemindersArgs,
      'invoiceId' | 'state'
    >
  >;
  togglePausePaymentReminders?: Resolver<
    Maybe<ResolversTypes['RemindersStatus']>,
    ParentType,
    ContextType,
    RequireFields<
      MutationTogglePausePaymentRemindersArgs,
      'invoiceId' | 'state'
    >
  >;
  generateMissingReminderJobs?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType
  >;
};

export type Resolvers<ContextType = any> = {
  Date?: GraphQLScalarType;
  ReferenceNumber?: GraphQLScalarType;
  Name?: GraphQLScalarType;
  Error?: ErrorResolvers<ContextType>;
  Article?: ArticleResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  ErpReference?: ErpReferenceResolvers<ContextType>;
  InvoiceItem?: InvoiceItemResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  InvoiceVat?: InvoiceVatResolvers<ContextType>;
  InvoiceId?: InvoiceIdResolvers<ContextType>;
  Journal?: JournalResolvers<ContextType>;
  Payer?: PayerResolvers<ContextType>;
  Address?: AddressResolvers<ContextType>;
  Payment?: PaymentResolvers<ContextType>;
  PayPalOrderId?: PayPalOrderIdResolvers<ContextType>;
  CreditNote?: CreditNoteResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  Coupon?: CouponResolvers<ContextType>;
  CouponCode?: CouponCodeResolvers<ContextType>;
  Waiver?: WaiverResolvers<ContextType>;
  ClientToken?: ClientTokenResolvers<ContextType>;
  PaginatedInvoices?: PaginatedInvoicesResolvers<ContextType>;
  PaginatedCoupons?: PaginatedCouponsResolvers<ContextType>;
  PaginatedCreditNotes?: PaginatedCreditNotesResolvers<ContextType>;
  RemindersStatus?: RemindersStatusResolvers<ContextType>;
  SentReminder?: SentReminderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  model?: ModelDirectiveResolver<any, any, ContextType>;
  filter?: FilterDirectiveResolver<any, any, ContextType>;
};

/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<
  ContextType = any
> = DirectiveResolvers<ContextType>;
