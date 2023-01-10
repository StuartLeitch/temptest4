import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  InvoicingName: any;
  ReferenceNumber: any;
};

export type Address = {
  __typename?: 'Address';
  addressLine1?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
};

export type AddressInput = {
  addressLine1?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
};

export type CatalogInput = {
  amount?: InputMaybe<Scalars['Float']>;
  journalId?: InputMaybe<Scalars['ID']>;
  publisherName?: InputMaybe<Scalars['String']>;
  zeroPriced: Scalars['Boolean'];
};

export type ClientToken = {
  __typename?: 'ClientToken';
  token: Scalars['String'];
};

export type Coupon = {
  __typename?: 'Coupon';
  code?: Maybe<Scalars['String']>;
  dateCreated?: Maybe<Scalars['Date']>;
  dateUpdated?: Maybe<Scalars['Date']>;
  expirationDate?: Maybe<Scalars['Date']>;
  id?: Maybe<Scalars['ID']>;
  invoiceItemType?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  redeemCount?: Maybe<Scalars['Int']>;
  reduction?: Maybe<Scalars['Float']>;
  status?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type CouponCode = {
  __typename?: 'CouponCode';
  code?: Maybe<Scalars['String']>;
};

export type CouponInput = {
  code?: InputMaybe<Scalars['String']>;
  expirationDate?: InputMaybe<Scalars['Date']>;
  id?: InputMaybe<Scalars['ID']>;
  invoiceItemType?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  reduction?: InputMaybe<Scalars['Float']>;
  status?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
};

export type CreditCardInput = {
  amount: Scalars['Float'];
  cardNumber: Scalars['String'];
  cvv: Scalars['String'];
  expiration: Scalars['String'];
  postalCode?: InputMaybe<Scalars['String']>;
};

export type CreditNote = {
  __typename?: 'CreditNote';
  creationReason?: Maybe<Scalars['String']>;
  dateCreated?: Maybe<Scalars['Date']>;
  dateIssued?: Maybe<Scalars['Date']>;
  dateUpdated?: Maybe<Scalars['Date']>;
  erpReference?: Maybe<ErpReference>;
  id?: Maybe<Scalars['String']>;
  invoice?: Maybe<Invoice>;
  invoiceId?: Maybe<Scalars['ID']>;
  persistentReferenceNumber?: Maybe<Scalars['ReferenceNumber']>;
  price?: Maybe<Scalars['Float']>;
  totalPrice?: Maybe<Scalars['Float']>;
  vat?: Maybe<Scalars['Float']>;
};

export enum CreditNoteReason {
  BAD_DEBT = 'BAD_DEBT',
  CHANGE_PAYER_DETAILS = 'CHANGE_PAYER_DETAILS',
  OTHER = 'OTHER',
  REDUCTION_APPLIED = 'REDUCTION_APPLIED',
  TA_LATE_APPROVAL = 'TA_LATE_APPROVAL',
  WAIVED_MANUSCRIPT = 'WAIVED_MANUSCRIPT',
  WITHDRAWN_MANUSCRIPT = 'WITHDRAWN_MANUSCRIPT'
}

export type ErpReference = {
  __typename?: 'ErpReference';
  attribute?: Maybe<Scalars['String']>;
  entity_id?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
  vendor?: Maybe<Scalars['String']>;
};

export type Error = {
  __typename?: 'Error';
  error?: Maybe<Scalars['String']>;
};

export type Invoice = {
  __typename?: 'Invoice';
  charge?: Maybe<Scalars['Float']>;
  creditNote?: Maybe<CreditNote>;
  customId?: Maybe<Scalars['ID']>;
  dateAccepted?: Maybe<Scalars['String']>;
  dateChanged?: Maybe<Scalars['String']>;
  dateCreated?: Maybe<Scalars['String']>;
  dateIssued?: Maybe<Scalars['String']>;
  dateMovedToFinal?: Maybe<Scalars['String']>;
  erpReference?: Maybe<Scalars['String']>;
  erpReferences?: Maybe<Array<Maybe<ErpReference>>>;
  invoiceId?: Maybe<Scalars['ID']>;
  invoiceItem?: Maybe<InvoiceItem>;
  netCharges?: Maybe<Scalars['Float']>;
  payer?: Maybe<Payer>;
  payment?: Maybe<Payment>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  price?: Maybe<Scalars['Float']>;
  referenceNumber?: Maybe<Scalars['ReferenceNumber']>;
  revenueRecognitionReference?: Maybe<Scalars['String']>;
  status?: Maybe<InvoiceStatus>;
  title?: Maybe<Scalars['String']>;
  totalPrice?: Maybe<Scalars['Float']>;
  transaction?: Maybe<Transaction>;
  type?: Maybe<Scalars['String']>;
  vat?: Maybe<Scalars['Float']>;
  vatAmount?: Maybe<Scalars['Float']>;
};

export type InvoiceFilters = {
  invoiceItem?: InputMaybe<InvoiceItemFilters>;
  invoiceStatus?: InputMaybe<Array<InputMaybe<InvoiceStatus>>>;
  reason?: InputMaybe<Array<InputMaybe<CreditNoteReason>>>;
  referenceNumber?: InputMaybe<Array<InputMaybe<Scalars['ReferenceNumber']>>>;
  transactionStatus?: InputMaybe<Array<InputMaybe<TransactionStatus>>>;
};

export type InvoiceId = {
  __typename?: 'InvoiceId';
  invoiceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type InvoiceItem = {
  __typename?: 'InvoiceItem';
  article?: Maybe<InvoicingArticle>;
  coupons?: Maybe<Array<Maybe<Coupon>>>;
  dateCreated?: Maybe<Scalars['Date']>;
  id?: Maybe<Scalars['String']>;
  invoiceId?: Maybe<Scalars['ID']>;
  manuscriptId?: Maybe<Scalars['ID']>;
  price?: Maybe<Scalars['Float']>;
  rate?: Maybe<Scalars['Float']>;
  taCode?: Maybe<Scalars['String']>;
  taDiscount?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
  vat?: Maybe<Scalars['Float']>;
  vatnote?: Maybe<Scalars['String']>;
  waivers?: Maybe<Array<Maybe<Waiver>>>;
};

export type InvoiceItemFilters = {
  article?: InputMaybe<InvoicingArticleFilters>;
};

export enum InvoiceStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
  PENDING = 'PENDING'
}

export type InvoiceVat = {
  __typename?: 'InvoiceVat';
  rate?: Maybe<Scalars['Float']>;
  vatNote?: Maybe<Scalars['String']>;
  vatPercentage?: Maybe<Scalars['Float']>;
};

export type InvoicingArticle = {
  __typename?: 'InvoicingArticle';
  articleType?: Maybe<Scalars['String']>;
  authorCountry?: Maybe<Scalars['String']>;
  authorEmail?: Maybe<Scalars['String']>;
  authorFirstName?: Maybe<Scalars['String']>;
  authorSurname?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['Date']>;
  customId?: Maybe<Scalars['ID']>;
  datePublished?: Maybe<Scalars['Date']>;
  id?: Maybe<Scalars['String']>;
  journalId?: Maybe<Scalars['ID']>;
  journalTitle?: Maybe<Scalars['String']>;
  preprintValue?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type InvoicingArticleFilters = {
  customId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  journalId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type InvoicingJournal = {
  __typename?: 'InvoicingJournal';
  amount?: Maybe<Scalars['Float']>;
  code?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  issn?: Maybe<Scalars['String']>;
  journalId: Scalars['ID'];
  journalTitle?: Maybe<Scalars['String']>;
  publisher?: Maybe<InvoicingPublisher>;
  publisherId?: Maybe<Scalars['ID']>;
  publisherName?: Maybe<Scalars['String']>;
  zeroPriced: Scalars['Boolean'];
};

export type InvoicingPublisher = {
  __typename?: 'InvoicingPublisher';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Log = {
  __typename?: 'Log';
  action?: Maybe<Scalars['String']>;
  entity?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  item_reference?: Maybe<Scalars['String']>;
  target?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Date']>;
  userAccount?: Maybe<Scalars['String']>;
};

export type LogsFilters = {
  endDate?: InputMaybe<Scalars['Date']>;
  limit?: InputMaybe<Scalars['Int']>;
  startDate?: InputMaybe<Scalars['Date']>;
};

export type MigrateApc = {
  discount?: InputMaybe<Scalars['Float']>;
  invoiceReference?: InputMaybe<Scalars['String']>;
  manuscriptId: Scalars['String'];
  paymentAmount?: InputMaybe<Scalars['Float']>;
  price: Scalars['Float'];
  vat?: InputMaybe<Scalars['Float']>;
};

export type MigratePayer = {
  address: MigratePayerAddress;
  email: Scalars['String'];
  name: Scalars['String'];
  organization?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
  vatRegistrationNumber?: InputMaybe<Scalars['String']>;
};

export type MigratePayerAddress = {
  addressLine1: Scalars['String'];
  addressLine2?: InputMaybe<Scalars['String']>;
  city: Scalars['String'];
  countryCode: Scalars['String'];
  state?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  applyCoupon?: Maybe<Coupon>;
  bankTransferPayment: Payment;
  confirmInvoice: Payer;
  createCoupon?: Maybe<Coupon>;
  createCreditNote: CreditNote;
  createPayPalOrder: PayPalOrderId;
  creditCardPayment: Payment;
  generateCreditNoteCompensatoryEvents?: Maybe<Scalars['String']>;
  generateInvoiceCompensatoryEvents?: Maybe<Scalars['String']>;
  generateInvoiceDraftCompensatoryEvents?: Maybe<Scalars['String']>;
  recordPayPalPayment: Scalars['ID'];
  togglePauseConfirmationReminders?: Maybe<RemindersStatus>;
  togglePausePaymentReminders?: Maybe<RemindersStatus>;
  updateCatalogItem?: Maybe<InvoicingJournal>;
  updateCoupon?: Maybe<Coupon>;
};


export type MutationApplyCouponArgs = {
  couponCode?: InputMaybe<Scalars['String']>;
  invoiceId?: InputMaybe<Scalars['ID']>;
};


export type MutationBankTransferPaymentArgs = {
  amount: Scalars['Float'];
  datePaid: Scalars['String'];
  invoiceId: Scalars['String'];
  markInvoiceAsPaid?: InputMaybe<Scalars['Boolean']>;
  payerId: Scalars['String'];
  paymentMethodId: Scalars['String'];
  paymentReference: Scalars['String'];
};


export type MutationConfirmInvoiceArgs = {
  payer: PayerInput;
};


export type MutationCreateCouponArgs = {
  coupon?: InputMaybe<CouponInput>;
};


export type MutationCreateCreditNoteArgs = {
  createDraft?: InputMaybe<Scalars['Boolean']>;
  invoiceId: Scalars['String'];
  reason?: InputMaybe<Scalars['String']>;
};


export type MutationCreatePayPalOrderArgs = {
  invoiceId: Scalars['ID'];
};


export type MutationCreditCardPaymentArgs = {
  amount: Scalars['Float'];
  invoiceId: Scalars['ID'];
  payerId: Scalars['String'];
  paymentMethodId: Scalars['String'];
  paymentMethodNonce: Scalars['String'];
};


export type MutationGenerateCreditNoteCompensatoryEventsArgs = {
  creditNoteIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  journalIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationGenerateInvoiceCompensatoryEventsArgs = {
  invoiceIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  journalIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationGenerateInvoiceDraftCompensatoryEventsArgs = {
  invoiceIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  journalIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationRecordPayPalPaymentArgs = {
  invoiceId: Scalars['ID'];
  orderId: Scalars['ID'];
};


export type MutationTogglePauseConfirmationRemindersArgs = {
  invoiceId: Scalars['ID'];
  state: Scalars['Boolean'];
};


export type MutationTogglePausePaymentRemindersArgs = {
  invoiceId: Scalars['ID'];
  state: Scalars['Boolean'];
};


export type MutationUpdateCatalogItemArgs = {
  catalogItem?: InputMaybe<CatalogInput>;
};


export type MutationUpdateCouponArgs = {
  coupon?: InputMaybe<CouponInput>;
};

export type PaginatedCatalog = {
  __typename?: 'PaginatedCatalog';
  catalogItems?: Maybe<Array<Maybe<InvoicingJournal>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PaginatedCoupons = {
  __typename?: 'PaginatedCoupons';
  coupons?: Maybe<Array<Maybe<Coupon>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PaginatedCreditNotes = {
  __typename?: 'PaginatedCreditNotes';
  creditNotes?: Maybe<Array<Maybe<CreditNote>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PaginatedInvoices = {
  __typename?: 'PaginatedInvoices';
  invoices?: Maybe<Array<Maybe<Invoice>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PaginatedLogs = {
  __typename?: 'PaginatedLogs';
  logs?: Maybe<Array<Maybe<Log>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PaginatedPublishers = {
  __typename?: 'PaginatedPublishers';
  publishers?: Maybe<Array<Maybe<InvoicingPublisher>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type Pagination = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
};

export type PayPalOrderId = {
  __typename?: 'PayPalOrderId';
  id: Scalars['String'];
};

export type Payer = {
  __typename?: 'Payer';
  address?: Maybe<Address>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  type?: Maybe<PayerType>;
  vatId?: Maybe<Scalars['String']>;
};

export type PayerInput = {
  address?: InputMaybe<AddressInput>;
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  invoiceId?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  organization?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<PayerType>;
  vatId?: InputMaybe<Scalars['String']>;
};

export enum PayerType {
  INDIVIDUAL = 'INDIVIDUAL',
  INSTITUTION = 'INSTITUTION'
}

export type Payment = {
  __typename?: 'Payment';
  amount?: Maybe<Scalars['Float']>;
  authorizationCode?: Maybe<Scalars['String']>;
  cardLastDigits?: Maybe<Scalars['String']>;
  datePaid?: Maybe<Scalars['Date']>;
  foreignPaymentId?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  invoiceId?: Maybe<Scalars['String']>;
  payerId?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentMethodId?: Maybe<Scalars['String']>;
  paymentProof?: Maybe<Scalars['String']>;
  status?: Maybe<PaymentStatus>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  id: Scalars['String'];
  isActive?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
};

export enum PaymentStatus {
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export type Query = {
  __typename?: 'Query';
  auditlog?: Maybe<Log>;
  auditlogs?: Maybe<PaginatedLogs>;
  coupon?: Maybe<Coupon>;
  coupons?: Maybe<PaginatedCoupons>;
  echo?: Maybe<Scalars['String']>;
  generateCouponCode?: Maybe<CouponCode>;
  getClientToken?: Maybe<ClientToken>;
  getCreditNoteById?: Maybe<CreditNote>;
  getCreditNoteByInvoiceId?: Maybe<CreditNote>;
  getCreditNoteByReferenceNumber?: Maybe<CreditNote>;
  getPaymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  getPublisherByName?: Maybe<InvoicingPublisher>;
  getPublisherDetails?: Maybe<InvoicingPublisher>;
  getPublishers?: Maybe<PaginatedPublishers>;
  getPublishersByPublisherId?: Maybe<PaginatedPublishers>;
  getRecentCreditNotes?: Maybe<PaginatedCreditNotes>;
  invoice?: Maybe<Invoice>;
  invoiceIdByManuscriptCustomId?: Maybe<InvoiceId>;
  invoiceVat?: Maybe<InvoiceVat>;
  invoiceWithAuthorization?: Maybe<Invoice>;
  invoices?: Maybe<PaginatedInvoices>;
  invoicingJournals?: Maybe<PaginatedCatalog>;
  remindersSent?: Maybe<Array<Maybe<SentReminder>>>;
  remindersStatus?: Maybe<RemindersStatus>;
};


export type QueryAuditlogArgs = {
  logId?: InputMaybe<Scalars['ID']>;
};


export type QueryAuditlogsArgs = {
  filters?: InputMaybe<LogsFilters>;
  pagination?: InputMaybe<Pagination>;
};


export type QueryCouponArgs = {
  couponCode: Scalars['String'];
};


export type QueryCouponsArgs = {
  pagination?: InputMaybe<Pagination>;
};


export type QueryEchoArgs = {
  value?: InputMaybe<Scalars['String']>;
};


export type QueryGetCreditNoteByIdArgs = {
  creditNoteId?: InputMaybe<Scalars['ID']>;
};


export type QueryGetCreditNoteByInvoiceIdArgs = {
  invoiceId?: InputMaybe<Scalars['ID']>;
};


export type QueryGetCreditNoteByReferenceNumberArgs = {
  referenceNumber?: InputMaybe<Scalars['String']>;
};


export type QueryGetPublisherByNameArgs = {
  publisherName?: InputMaybe<Scalars['String']>;
};


export type QueryGetPublisherDetailsArgs = {
  publisherId?: InputMaybe<Scalars['ID']>;
};


export type QueryGetPublishersArgs = {
  pagination?: InputMaybe<Pagination>;
};


export type QueryGetPublishersByPublisherIdArgs = {
  pagination?: InputMaybe<Pagination>;
};


export type QueryGetRecentCreditNotesArgs = {
  filters?: InputMaybe<InvoiceFilters>;
  pagination?: InputMaybe<Pagination>;
};


export type QueryInvoiceArgs = {
  invoiceId?: InputMaybe<Scalars['ID']>;
};


export type QueryInvoiceIdByManuscriptCustomIdArgs = {
  customId?: InputMaybe<Scalars['ID']>;
};


export type QueryInvoiceVatArgs = {
  country?: InputMaybe<Scalars['String']>;
  invoiceId?: InputMaybe<Scalars['ID']>;
  payerType?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
};


export type QueryInvoiceWithAuthorizationArgs = {
  invoiceId?: InputMaybe<Scalars['ID']>;
};


export type QueryInvoicesArgs = {
  filters?: InputMaybe<InvoiceFilters>;
  pagination?: InputMaybe<Pagination>;
};


export type QueryInvoicingJournalsArgs = {
  pagination?: InputMaybe<Pagination>;
};


export type QueryRemindersSentArgs = {
  invoiceId: Scalars['ID'];
};


export type QueryRemindersStatusArgs = {
  invoiceId: Scalars['ID'];
};

export enum ReminderType {
  INVOICE_CREATED = 'INVOICE_CREATED',
  REMINDER_CONFIRMATION = 'REMINDER_CONFIRMATION',
  REMINDER_PAYMENT = 'REMINDER_PAYMENT',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY'
}

export type RemindersStatus = {
  __typename?: 'RemindersStatus';
  confirmation?: Maybe<Scalars['Boolean']>;
  payment?: Maybe<Scalars['Boolean']>;
};

export type SentReminder = {
  __typename?: 'SentReminder';
  forInvoice?: Maybe<Scalars['ID']>;
  toEmail?: Maybe<Scalars['String']>;
  type?: Maybe<ReminderType>;
  when?: Maybe<Scalars['Date']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
};

export enum TransactionStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  FINAL = 'FINAL'
}

export type Waiver = {
  __typename?: 'Waiver';
  reduction?: Maybe<Scalars['Float']>;
  type_id?: Maybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Address: ResolverTypeWrapper<Address>;
  AddressInput: AddressInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CatalogInput: CatalogInput;
  ClientToken: ResolverTypeWrapper<ClientToken>;
  Coupon: ResolverTypeWrapper<Coupon>;
  CouponCode: ResolverTypeWrapper<CouponCode>;
  CouponInput: CouponInput;
  CreditCardInput: CreditCardInput;
  CreditNote: ResolverTypeWrapper<CreditNote>;
  CreditNoteReason: CreditNoteReason;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  ErpReference: ResolverTypeWrapper<ErpReference>;
  Error: ResolverTypeWrapper<Error>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Invoice: ResolverTypeWrapper<Invoice>;
  InvoiceFilters: InvoiceFilters;
  InvoiceId: ResolverTypeWrapper<InvoiceId>;
  InvoiceItem: ResolverTypeWrapper<InvoiceItem>;
  InvoiceItemFilters: InvoiceItemFilters;
  InvoiceStatus: InvoiceStatus;
  InvoiceVat: ResolverTypeWrapper<InvoiceVat>;
  InvoicingArticle: ResolverTypeWrapper<InvoicingArticle>;
  InvoicingArticleFilters: InvoicingArticleFilters;
  InvoicingJournal: ResolverTypeWrapper<InvoicingJournal>;
  InvoicingName: ResolverTypeWrapper<Scalars['InvoicingName']>;
  InvoicingPublisher: ResolverTypeWrapper<InvoicingPublisher>;
  Log: ResolverTypeWrapper<Log>;
  LogsFilters: LogsFilters;
  MigrateAPC: MigrateApc;
  MigratePayer: MigratePayer;
  MigratePayerAddress: MigratePayerAddress;
  Mutation: ResolverTypeWrapper<{}>;
  PaginatedCatalog: ResolverTypeWrapper<PaginatedCatalog>;
  PaginatedCoupons: ResolverTypeWrapper<PaginatedCoupons>;
  PaginatedCreditNotes: ResolverTypeWrapper<PaginatedCreditNotes>;
  PaginatedInvoices: ResolverTypeWrapper<PaginatedInvoices>;
  PaginatedLogs: ResolverTypeWrapper<PaginatedLogs>;
  PaginatedPublishers: ResolverTypeWrapper<PaginatedPublishers>;
  Pagination: Pagination;
  PayPalOrderId: ResolverTypeWrapper<PayPalOrderId>;
  Payer: ResolverTypeWrapper<Payer>;
  PayerInput: PayerInput;
  PayerType: PayerType;
  Payment: ResolverTypeWrapper<Payment>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  PaymentStatus: PaymentStatus;
  Query: ResolverTypeWrapper<{}>;
  ReferenceNumber: ResolverTypeWrapper<Scalars['ReferenceNumber']>;
  ReminderType: ReminderType;
  RemindersStatus: ResolverTypeWrapper<RemindersStatus>;
  SentReminder: ResolverTypeWrapper<SentReminder>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionStatus: TransactionStatus;
  Waiver: ResolverTypeWrapper<Waiver>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Address: Address;
  AddressInput: AddressInput;
  Boolean: Scalars['Boolean'];
  CatalogInput: CatalogInput;
  ClientToken: ClientToken;
  Coupon: Coupon;
  CouponCode: CouponCode;
  CouponInput: CouponInput;
  CreditCardInput: CreditCardInput;
  CreditNote: CreditNote;
  Date: Scalars['Date'];
  ErpReference: ErpReference;
  Error: Error;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Invoice: Invoice;
  InvoiceFilters: InvoiceFilters;
  InvoiceId: InvoiceId;
  InvoiceItem: InvoiceItem;
  InvoiceItemFilters: InvoiceItemFilters;
  InvoiceVat: InvoiceVat;
  InvoicingArticle: InvoicingArticle;
  InvoicingArticleFilters: InvoicingArticleFilters;
  InvoicingJournal: InvoicingJournal;
  InvoicingName: Scalars['InvoicingName'];
  InvoicingPublisher: InvoicingPublisher;
  Log: Log;
  LogsFilters: LogsFilters;
  MigrateAPC: MigrateApc;
  MigratePayer: MigratePayer;
  MigratePayerAddress: MigratePayerAddress;
  Mutation: {};
  PaginatedCatalog: PaginatedCatalog;
  PaginatedCoupons: PaginatedCoupons;
  PaginatedCreditNotes: PaginatedCreditNotes;
  PaginatedInvoices: PaginatedInvoices;
  PaginatedLogs: PaginatedLogs;
  PaginatedPublishers: PaginatedPublishers;
  Pagination: Pagination;
  PayPalOrderId: PayPalOrderId;
  Payer: Payer;
  PayerInput: PayerInput;
  Payment: Payment;
  PaymentMethod: PaymentMethod;
  Query: {};
  ReferenceNumber: Scalars['ReferenceNumber'];
  RemindersStatus: RemindersStatus;
  SentReminder: SentReminder;
  String: Scalars['String'];
  Transaction: Transaction;
  Waiver: Waiver;
};

export type FilterDirectiveArgs = {
  key?: Maybe<Scalars['InvoicingName']>;
};

export type FilterDirectiveResolver<Result, Parent, ContextType = any, Args = FilterDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ModelDirectiveArgs = {
  id?: Maybe<Scalars['ID']>;
};

export type ModelDirectiveResolver<Result, Parent, ContextType = any, Args = ModelDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AddressResolvers<ContextType = any, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = {
  addressLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientTokenResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClientToken'] = ResolversParentTypes['ClientToken']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponResolvers<ContextType = any, ParentType extends ResolversParentTypes['Coupon'] = ResolversParentTypes['Coupon']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateUpdated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  expirationDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  invoiceItemType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  redeemCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  reduction?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponCodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CouponCode'] = ResolversParentTypes['CouponCode']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditNoteResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreditNote'] = ResolversParentTypes['CreditNote']> = {
  creationReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateIssued?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateUpdated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  erpReference?: Resolver<Maybe<ResolversTypes['ErpReference']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  persistentReferenceNumber?: Resolver<Maybe<ResolversTypes['ReferenceNumber']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type ErpReferenceResolvers<ContextType = any, ParentType extends ResolversParentTypes['ErpReference'] = ResolversParentTypes['ErpReference']> = {
  attribute?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entity_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = {
  charge?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  creditNote?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType>;
  customId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  dateAccepted?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateChanged?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateIssued?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateMovedToFinal?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  erpReference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  erpReferences?: Resolver<Maybe<Array<Maybe<ResolversTypes['ErpReference']>>>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  invoiceItem?: Resolver<Maybe<ResolversTypes['InvoiceItem']>, ParentType, ContextType>;
  netCharges?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  payer?: Resolver<Maybe<ResolversTypes['Payer']>, ParentType, ContextType>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType>;
  payments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Payment']>>>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  referenceNumber?: Resolver<Maybe<ResolversTypes['ReferenceNumber']>, ParentType, ContextType>;
  revenueRecognitionReference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['InvoiceStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vatAmount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceIdResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoiceId'] = ResolversParentTypes['InvoiceId']> = {
  invoiceId?: Resolver<Maybe<Array<Maybe<ResolversTypes['ID']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoiceItem'] = ResolversParentTypes['InvoiceItem']> = {
  article?: Resolver<Maybe<ResolversTypes['InvoicingArticle']>, ParentType, ContextType>;
  coupons?: Resolver<Maybe<Array<Maybe<ResolversTypes['Coupon']>>>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  manuscriptId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taDiscount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vatnote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  waivers?: Resolver<Maybe<Array<Maybe<ResolversTypes['Waiver']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceVatResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoiceVat'] = ResolversParentTypes['InvoiceVat']> = {
  rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vatNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vatPercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoicingArticleResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoicingArticle'] = ResolversParentTypes['InvoicingArticle']> = {
  articleType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorCountry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorFirstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorSurname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  customId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  datePublished?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  journalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  journalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preprintValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoicingJournalResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoicingJournal'] = ResolversParentTypes['InvoicingJournal']> = {
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  issn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  journalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  journalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publisher?: Resolver<Maybe<ResolversTypes['InvoicingPublisher']>, ParentType, ContextType>;
  publisherId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  publisherName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zeroPriced?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface InvoicingNameScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['InvoicingName'], any> {
  name: 'InvoicingName';
}

export type InvoicingPublisherResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoicingPublisher'] = ResolversParentTypes['InvoicingPublisher']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogResolvers<ContextType = any, ParentType extends ResolversParentTypes['Log'] = ResolversParentTypes['Log']> = {
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  item_reference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  userAccount?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  applyCoupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, Partial<MutationApplyCouponArgs>>;
  bankTransferPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationBankTransferPaymentArgs, 'amount' | 'datePaid' | 'invoiceId' | 'payerId' | 'paymentMethodId' | 'paymentReference'>>;
  confirmInvoice?: Resolver<ResolversTypes['Payer'], ParentType, ContextType, RequireFields<MutationConfirmInvoiceArgs, 'payer'>>;
  createCoupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, Partial<MutationCreateCouponArgs>>;
  createCreditNote?: Resolver<ResolversTypes['CreditNote'], ParentType, ContextType, RequireFields<MutationCreateCreditNoteArgs, 'invoiceId'>>;
  createPayPalOrder?: Resolver<ResolversTypes['PayPalOrderId'], ParentType, ContextType, RequireFields<MutationCreatePayPalOrderArgs, 'invoiceId'>>;
  creditCardPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationCreditCardPaymentArgs, 'amount' | 'invoiceId' | 'payerId' | 'paymentMethodId' | 'paymentMethodNonce'>>;
  generateCreditNoteCompensatoryEvents?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<MutationGenerateCreditNoteCompensatoryEventsArgs>>;
  generateInvoiceCompensatoryEvents?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<MutationGenerateInvoiceCompensatoryEventsArgs>>;
  generateInvoiceDraftCompensatoryEvents?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<MutationGenerateInvoiceDraftCompensatoryEventsArgs>>;
  recordPayPalPayment?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationRecordPayPalPaymentArgs, 'invoiceId' | 'orderId'>>;
  togglePauseConfirmationReminders?: Resolver<Maybe<ResolversTypes['RemindersStatus']>, ParentType, ContextType, RequireFields<MutationTogglePauseConfirmationRemindersArgs, 'invoiceId' | 'state'>>;
  togglePausePaymentReminders?: Resolver<Maybe<ResolversTypes['RemindersStatus']>, ParentType, ContextType, RequireFields<MutationTogglePausePaymentRemindersArgs, 'invoiceId' | 'state'>>;
  updateCatalogItem?: Resolver<Maybe<ResolversTypes['InvoicingJournal']>, ParentType, ContextType, Partial<MutationUpdateCatalogItemArgs>>;
  updateCoupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, Partial<MutationUpdateCouponArgs>>;
};

export type PaginatedCatalogResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCatalog'] = ResolversParentTypes['PaginatedCatalog']> = {
  catalogItems?: Resolver<Maybe<Array<Maybe<ResolversTypes['InvoicingJournal']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCouponsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCoupons'] = ResolversParentTypes['PaginatedCoupons']> = {
  coupons?: Resolver<Maybe<Array<Maybe<ResolversTypes['Coupon']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCreditNotesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCreditNotes'] = ResolversParentTypes['PaginatedCreditNotes']> = {
  creditNotes?: Resolver<Maybe<Array<Maybe<ResolversTypes['CreditNote']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedInvoicesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedInvoices'] = ResolversParentTypes['PaginatedInvoices']> = {
  invoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['Invoice']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedLogsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedLogs'] = ResolversParentTypes['PaginatedLogs']> = {
  logs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Log']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedPublishersResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedPublishers'] = ResolversParentTypes['PaginatedPublishers']> = {
  publishers?: Resolver<Maybe<Array<Maybe<ResolversTypes['InvoicingPublisher']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PayPalOrderIdResolvers<ContextType = any, ParentType extends ResolversParentTypes['PayPalOrderId'] = ResolversParentTypes['PayPalOrderId']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Payer'] = ResolversParentTypes['Payer']> = {
  address?: Resolver<Maybe<ResolversTypes['Address']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['PayerType']>, ParentType, ContextType>;
  vatId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Payment'] = ResolversParentTypes['Payment']> = {
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  authorizationCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cardLastDigits?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  datePaid?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  foreignPaymentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  paymentMethodId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentProof?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PaymentStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  auditlog?: Resolver<Maybe<ResolversTypes['Log']>, ParentType, ContextType, Partial<QueryAuditlogArgs>>;
  auditlogs?: Resolver<Maybe<ResolversTypes['PaginatedLogs']>, ParentType, ContextType, Partial<QueryAuditlogsArgs>>;
  coupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, RequireFields<QueryCouponArgs, 'couponCode'>>;
  coupons?: Resolver<Maybe<ResolversTypes['PaginatedCoupons']>, ParentType, ContextType, Partial<QueryCouponsArgs>>;
  echo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<QueryEchoArgs>>;
  generateCouponCode?: Resolver<Maybe<ResolversTypes['CouponCode']>, ParentType, ContextType>;
  getClientToken?: Resolver<Maybe<ResolversTypes['ClientToken']>, ParentType, ContextType>;
  getCreditNoteById?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType, Partial<QueryGetCreditNoteByIdArgs>>;
  getCreditNoteByInvoiceId?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType, Partial<QueryGetCreditNoteByInvoiceIdArgs>>;
  getCreditNoteByReferenceNumber?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType, Partial<QueryGetCreditNoteByReferenceNumberArgs>>;
  getPaymentMethods?: Resolver<Maybe<Array<Maybe<ResolversTypes['PaymentMethod']>>>, ParentType, ContextType>;
  getPublisherByName?: Resolver<Maybe<ResolversTypes['InvoicingPublisher']>, ParentType, ContextType, Partial<QueryGetPublisherByNameArgs>>;
  getPublisherDetails?: Resolver<Maybe<ResolversTypes['InvoicingPublisher']>, ParentType, ContextType, Partial<QueryGetPublisherDetailsArgs>>;
  getPublishers?: Resolver<Maybe<ResolversTypes['PaginatedPublishers']>, ParentType, ContextType, Partial<QueryGetPublishersArgs>>;
  getPublishersByPublisherId?: Resolver<Maybe<ResolversTypes['PaginatedPublishers']>, ParentType, ContextType, Partial<QueryGetPublishersByPublisherIdArgs>>;
  getRecentCreditNotes?: Resolver<Maybe<ResolversTypes['PaginatedCreditNotes']>, ParentType, ContextType, Partial<QueryGetRecentCreditNotesArgs>>;
  invoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, Partial<QueryInvoiceArgs>>;
  invoiceIdByManuscriptCustomId?: Resolver<Maybe<ResolversTypes['InvoiceId']>, ParentType, ContextType, Partial<QueryInvoiceIdByManuscriptCustomIdArgs>>;
  invoiceVat?: Resolver<Maybe<ResolversTypes['InvoiceVat']>, ParentType, ContextType, Partial<QueryInvoiceVatArgs>>;
  invoiceWithAuthorization?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, Partial<QueryInvoiceWithAuthorizationArgs>>;
  invoices?: Resolver<Maybe<ResolversTypes['PaginatedInvoices']>, ParentType, ContextType, Partial<QueryInvoicesArgs>>;
  invoicingJournals?: Resolver<Maybe<ResolversTypes['PaginatedCatalog']>, ParentType, ContextType, Partial<QueryInvoicingJournalsArgs>>;
  remindersSent?: Resolver<Maybe<Array<Maybe<ResolversTypes['SentReminder']>>>, ParentType, ContextType, RequireFields<QueryRemindersSentArgs, 'invoiceId'>>;
  remindersStatus?: Resolver<Maybe<ResolversTypes['RemindersStatus']>, ParentType, ContextType, RequireFields<QueryRemindersStatusArgs, 'invoiceId'>>;
};

export interface ReferenceNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ReferenceNumber'], any> {
  name: 'ReferenceNumber';
}

export type RemindersStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemindersStatus'] = ResolversParentTypes['RemindersStatus']> = {
  confirmation?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  payment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SentReminderResolvers<ContextType = any, ParentType extends ResolversParentTypes['SentReminder'] = ResolversParentTypes['SentReminder']> = {
  forInvoice?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  toEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ReminderType']>, ParentType, ContextType>;
  when?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransactionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WaiverResolvers<ContextType = any, ParentType extends ResolversParentTypes['Waiver'] = ResolversParentTypes['Waiver']> = {
  reduction?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Address?: AddressResolvers<ContextType>;
  ClientToken?: ClientTokenResolvers<ContextType>;
  Coupon?: CouponResolvers<ContextType>;
  CouponCode?: CouponCodeResolvers<ContextType>;
  CreditNote?: CreditNoteResolvers<ContextType>;
  Date?: GraphQLScalarType;
  ErpReference?: ErpReferenceResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  InvoiceId?: InvoiceIdResolvers<ContextType>;
  InvoiceItem?: InvoiceItemResolvers<ContextType>;
  InvoiceVat?: InvoiceVatResolvers<ContextType>;
  InvoicingArticle?: InvoicingArticleResolvers<ContextType>;
  InvoicingJournal?: InvoicingJournalResolvers<ContextType>;
  InvoicingName?: GraphQLScalarType;
  InvoicingPublisher?: InvoicingPublisherResolvers<ContextType>;
  Log?: LogResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PaginatedCatalog?: PaginatedCatalogResolvers<ContextType>;
  PaginatedCoupons?: PaginatedCouponsResolvers<ContextType>;
  PaginatedCreditNotes?: PaginatedCreditNotesResolvers<ContextType>;
  PaginatedInvoices?: PaginatedInvoicesResolvers<ContextType>;
  PaginatedLogs?: PaginatedLogsResolvers<ContextType>;
  PaginatedPublishers?: PaginatedPublishersResolvers<ContextType>;
  PayPalOrderId?: PayPalOrderIdResolvers<ContextType>;
  Payer?: PayerResolvers<ContextType>;
  Payment?: PaymentResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReferenceNumber?: GraphQLScalarType;
  RemindersStatus?: RemindersStatusResolvers<ContextType>;
  SentReminder?: SentReminderResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  Waiver?: WaiverResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  filter?: FilterDirectiveResolver<any, any, ContextType>;
  model?: ModelDirectiveResolver<any, any, ContextType>;
};
