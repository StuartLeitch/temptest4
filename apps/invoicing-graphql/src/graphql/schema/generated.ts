import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
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
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  addressLine1?: Maybe<Scalars['String']>;
};

export type AddressInput = {
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  addressLine1?: Maybe<Scalars['String']>;
};

export type CatalogInput = {
  journalId?: Maybe<Scalars['ID']>;
  publisherName?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  zeroPriced: Scalars['Boolean'];
};

export type ClientToken = {
  __typename?: 'ClientToken';
  token: Scalars['String'];
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

export type CreditCardInput = {
  amount: Scalars['Float'];
  cardNumber: Scalars['String'];
  expiration: Scalars['String'];
  cvv: Scalars['String'];
  postalCode?: Maybe<Scalars['String']>;
};

export type CreditNote = {
  __typename?: 'CreditNote';
  id?: Maybe<Scalars['String']>;
  invoiceId?: Maybe<Scalars['ID']>;
  creationReason?: Maybe<Scalars['String']>;
  vat?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  persistentReferenceNumber?: Maybe<Scalars['ReferenceNumber']>;
  dateCreated?: Maybe<Scalars['Date']>;
  dateIssued?: Maybe<Scalars['Date']>;
  dateUpdated?: Maybe<Scalars['Date']>;
  erpReference?: Maybe<ErpReference>;
  invoice?: Maybe<Invoice>;
};

export enum CreditNoteReason {
  WITHDRAWN_MANUSCRIPT = 'WITHDRAWN_MANUSCRIPT',
  REDUCTION_APPLIED = 'REDUCTION_APPLIED',
  WAIVED_MANUSCRIPT = 'WAIVED_MANUSCRIPT',
  CHANGE_PAYER_DETAILS = 'CHANGE_PAYER_DETAILS',
  BAD_DEBT = 'BAD_DEBT',
  OTHER = 'OTHER'
}


export type ErpReference = {
  __typename?: 'ErpReference';
  entity_id?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  vendor?: Maybe<Scalars['String']>;
  attribute?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type Error = {
  __typename?: 'Error';
  error?: Maybe<Scalars['String']>;
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
  referenceNumber?: Maybe<Scalars['ReferenceNumber']>;
  invoiceItem?: Maybe<InvoiceItem>;
  title?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  customId?: Maybe<Scalars['ID']>;
  type?: Maybe<Scalars['String']>;
  payment?: Maybe<Payment>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  transaction?: Maybe<Transaction>;
  creditNote?: Maybe<CreditNote>;
};

export type InvoiceFilters = {
  reason?: Maybe<Array<Maybe<CreditNoteReason>>>;
  invoiceStatus?: Maybe<Array<Maybe<InvoiceStatus>>>;
  transactionStatus?: Maybe<Array<Maybe<TransactionStatus>>>;
  referenceNumber?: Maybe<Array<Maybe<Scalars['ReferenceNumber']>>>;
  invoiceItem?: Maybe<InvoiceItemFilters>;
};

export type InvoiceId = {
  __typename?: 'InvoiceId';
  invoiceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

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
  article?: Maybe<InvoicingArticle>;
  dateCreated?: Maybe<Scalars['Date']>;
  coupons?: Maybe<Array<Maybe<Coupon>>>;
  waivers?: Maybe<Array<Maybe<Waiver>>>;
};

export type InvoiceItemFilters = {
  article?: Maybe<InvoicingArticleFilters>;
};

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FINAL = 'FINAL'
}

export type InvoiceVat = {
  __typename?: 'InvoiceVat';
  vatPercentage?: Maybe<Scalars['Float']>;
  vatNote?: Maybe<Scalars['String']>;
  rate?: Maybe<Scalars['Float']>;
};

export type InvoicingArticle = {
  __typename?: 'InvoicingArticle';
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

export type InvoicingArticleFilters = {
  journalId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  customId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type InvoicingJournal = {
  __typename?: 'InvoicingJournal';
  id: Scalars['String'];
  journalId: Scalars['ID'];
  journalTitle?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  issn?: Maybe<Scalars['String']>;
  publisherId?: Maybe<Scalars['ID']>;
  publisher?: Maybe<InvoicingPublisher>;
  publisherName?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  zeroPriced: Scalars['Boolean'];
};


export type InvoicingPublisher = {
  __typename?: 'InvoicingPublisher';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Log = {
  __typename?: 'Log';
  id?: Maybe<Scalars['ID']>;
  userAccount?: Maybe<Scalars['String']>;
  entity?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Date']>;
  item_reference?: Maybe<Scalars['String']>;
  target?: Maybe<Scalars['String']>;
};

export type LogsFilters = {
  startDate?: Maybe<Scalars['Date']>;
  endDate?: Maybe<Scalars['Date']>;
  limit?: Maybe<Scalars['Int']>;
};

export type MigrateApc = {
  invoiceReference?: Maybe<Scalars['String']>;
  paymentAmount?: Maybe<Scalars['Float']>;
  manuscriptId: Scalars['String'];
  discount?: Maybe<Scalars['Float']>;
  price: Scalars['Float'];
  vat?: Maybe<Scalars['Float']>;
};

export type MigratePayer = {
  vatRegistrationNumber?: Maybe<Scalars['String']>;
  address: MigratePayerAddress;
  organization?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
};

export type MigratePayerAddress = {
  addressLine2?: Maybe<Scalars['String']>;
  addressLine1: Scalars['String'];
  countryCode: Scalars['String'];
  state?: Maybe<Scalars['String']>;
  city: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  confirmInvoice: Payer;
  applyCoupon?: Maybe<Coupon>;
  updateCoupon?: Maybe<Coupon>;
  updateCatalogItem?: Maybe<InvoicingJournal>;
  createCoupon?: Maybe<Coupon>;
  creditCardPayment: Payment;
  bankTransferPayment: Payment;
  createCreditNote: CreditNote;
  createPayPalOrder: PayPalOrderId;
  recordPayPalPayment: Scalars['ID'];
  generateInvoiceCompensatoryEvents?: Maybe<Scalars['String']>;
  generateCreditNoteCompensatoryEvents?: Maybe<Scalars['String']>;
  generateInvoiceDraftCompensatoryEvents?: Maybe<Scalars['String']>;
  togglePauseConfirmationReminders?: Maybe<RemindersStatus>;
  togglePausePaymentReminders?: Maybe<RemindersStatus>;
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


export type MutationUpdateCatalogItemArgs = {
  catalogItem?: Maybe<CatalogInput>;
};


export type MutationCreateCouponArgs = {
  coupon?: Maybe<CouponInput>;
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


export type MutationGenerateInvoiceCompensatoryEventsArgs = {
  invoiceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  journalIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type MutationGenerateCreditNoteCompensatoryEventsArgs = {
  creditNoteIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  journalIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type MutationGenerateInvoiceDraftCompensatoryEventsArgs = {
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

export type PaginatedCatalog = {
  __typename?: 'PaginatedCatalog';
  totalCount?: Maybe<Scalars['Int']>;
  catalogItems?: Maybe<Array<Maybe<InvoicingJournal>>>;
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

export type PaginatedInvoices = {
  __typename?: 'PaginatedInvoices';
  totalCount?: Maybe<Scalars['Int']>;
  invoices?: Maybe<Array<Maybe<Invoice>>>;
};

export type PaginatedLogs = {
  __typename?: 'PaginatedLogs';
  totalCount?: Maybe<Scalars['Int']>;
  logs?: Maybe<Array<Maybe<Log>>>;
};

export type PaginatedPublishers = {
  __typename?: 'PaginatedPublishers';
  totalCount?: Maybe<Scalars['Int']>;
  publishers?: Maybe<Array<Maybe<InvoicingPublisher>>>;
};

export type Pagination = {
  page?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type PayPalOrderId = {
  __typename?: 'PayPalOrderId';
  id: Scalars['String'];
};

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

export enum PayerType {
  INSTITUTION = 'INSTITUTION',
  INDIVIDUAL = 'INDIVIDUAL'
}

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

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  id: Scalars['String'];
  name: Scalars['String'];
  isActive?: Maybe<Scalars['Boolean']>;
};

export enum PaymentStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED'
}

export type Query = {
  __typename?: 'Query';
  getCreditNoteByInvoiceId?: Maybe<CreditNote>;
  getCreditNoteById?: Maybe<CreditNote>;
  getRecentCreditNotes?: Maybe<PaginatedCreditNotes>;
  getCreditNoteByReferenceNumber?: Maybe<CreditNote>;
  getPaymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  getClientToken?: Maybe<ClientToken>;
  getPublishers?: Maybe<PaginatedPublishers>;
  getPublisherDetails?: Maybe<InvoicingPublisher>;
  getPublishersByPublisherId?: Maybe<PaginatedPublishers>;
  getPublisherByName?: Maybe<InvoicingPublisher>;
  generateCouponCode?: Maybe<CouponCode>;
  invoice?: Maybe<Invoice>;
  invoiceWithAuthorization?: Maybe<Invoice>;
  invoiceVat?: Maybe<InvoiceVat>;
  invoices?: Maybe<PaginatedInvoices>;
  coupon?: Maybe<Coupon>;
  coupons?: Maybe<PaginatedCoupons>;
  invoiceIdByManuscriptCustomId?: Maybe<InvoiceId>;
  invoicingJournals?: Maybe<PaginatedCatalog>;
  echo?: Maybe<Scalars['String']>;
  remindersStatus?: Maybe<RemindersStatus>;
  remindersSent?: Maybe<Array<Maybe<SentReminder>>>;
  auditlogs?: Maybe<PaginatedLogs>;
  auditlog?: Maybe<Log>;
};


export type QueryGetCreditNoteByInvoiceIdArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
};


export type QueryGetCreditNoteByIdArgs = {
  creditNoteId?: Maybe<Scalars['ID']>;
};


export type QueryGetRecentCreditNotesArgs = {
  filters?: Maybe<InvoiceFilters>;
  pagination?: Maybe<Pagination>;
};


export type QueryGetCreditNoteByReferenceNumberArgs = {
  referenceNumber?: Maybe<Scalars['String']>;
};


export type QueryGetPublishersArgs = {
  pagination?: Maybe<Pagination>;
};


export type QueryGetPublisherDetailsArgs = {
  publisherId?: Maybe<Scalars['ID']>;
};


export type QueryGetPublishersByPublisherIdArgs = {
  pagination?: Maybe<Pagination>;
};


export type QueryGetPublisherByNameArgs = {
  publisherName?: Maybe<Scalars['String']>;
};


export type QueryInvoiceArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
};


export type QueryInvoiceWithAuthorizationArgs = {
  invoiceId?: Maybe<Scalars['ID']>;
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


export type QueryInvoicingJournalsArgs = {
  pagination?: Maybe<Pagination>;
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


export type QueryAuditlogsArgs = {
  pagination?: Maybe<Pagination>;
  filters?: Maybe<LogsFilters>;
};


export type QueryAuditlogArgs = {
  logId?: Maybe<Scalars['ID']>;
};


export enum ReminderType {
  REMINDER_CONFIRMATION = 'REMINDER_CONFIRMATION',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY',
  REMINDER_PAYMENT = 'REMINDER_PAYMENT',
  INVOICE_CREATED = 'INVOICE_CREATED'
}

export type RemindersStatus = {
  __typename?: 'RemindersStatus';
  confirmation?: Maybe<Scalars['Boolean']>;
  payment?: Maybe<Scalars['Boolean']>;
};

export type SentReminder = {
  __typename?: 'SentReminder';
  forInvoice?: Maybe<Scalars['ID']>;
  type?: Maybe<ReminderType>;
  toEmail?: Maybe<Scalars['String']>;
  when?: Maybe<Scalars['Date']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
};

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FINAL = 'FINAL'
}

export type Waiver = {
  __typename?: 'Waiver';
  reduction?: Maybe<Scalars['Float']>;
  type_id?: Maybe<Scalars['String']>;
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
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
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
  String: ResolverTypeWrapper<Scalars['String']>;
  AddressInput: AddressInput;
  CatalogInput: CatalogInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ClientToken: ResolverTypeWrapper<ClientToken>;
  Coupon: ResolverTypeWrapper<Coupon>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  CouponCode: ResolverTypeWrapper<CouponCode>;
  CouponInput: CouponInput;
  CreditCardInput: CreditCardInput;
  CreditNote: ResolverTypeWrapper<CreditNote>;
  CreditNoteReason: CreditNoteReason;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  ErpReference: ResolverTypeWrapper<ErpReference>;
  Error: ResolverTypeWrapper<Error>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
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
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionStatus: TransactionStatus;
  Waiver: ResolverTypeWrapper<Waiver>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Address: Address;
  String: Scalars['String'];
  AddressInput: AddressInput;
  CatalogInput: CatalogInput;
  Float: Scalars['Float'];
  Boolean: Scalars['Boolean'];
  ClientToken: ClientToken;
  Coupon: Coupon;
  Int: Scalars['Int'];
  CouponCode: CouponCode;
  CouponInput: CouponInput;
  CreditCardInput: CreditCardInput;
  CreditNote: CreditNote;
  Date: Scalars['Date'];
  ErpReference: ErpReference;
  Error: Error;
  ID: Scalars['ID'];
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
  Transaction: Transaction;
  Waiver: Waiver;
};

export type FilterDirectiveArgs = {   key?: Maybe<Scalars['InvoicingName']>; };

export type FilterDirectiveResolver<Result, Parent, ContextType = any, Args = FilterDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ModelDirectiveArgs = {   id?: Maybe<Scalars['ID']>; };

export type ModelDirectiveResolver<Result, Parent, ContextType = any, Args = ModelDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AddressResolvers<ContextType = any, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addressLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientTokenResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClientToken'] = ResolversParentTypes['ClientToken']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponResolvers<ContextType = any, ParentType extends ResolversParentTypes['Coupon'] = ResolversParentTypes['Coupon']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  reduction?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateUpdated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  expirationDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  invoiceItemType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  redeemCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponCodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CouponCode'] = ResolversParentTypes['CouponCode']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditNoteResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreditNote'] = ResolversParentTypes['CreditNote']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  creationReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  persistentReferenceNumber?: Resolver<Maybe<ResolversTypes['ReferenceNumber']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateIssued?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateUpdated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  erpReference?: Resolver<Maybe<ResolversTypes['ErpReference']>, ParentType, ContextType>;
  invoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type ErpReferenceResolvers<ContextType = any, ParentType extends ResolversParentTypes['ErpReference'] = ResolversParentTypes['ErpReference']> = {
  entity_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attribute?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = {
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateChanged?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateIssued?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateAccepted?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateMovedToFinal?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  charge?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['InvoiceStatus']>, ParentType, ContextType>;
  payer?: Resolver<Maybe<ResolversTypes['Payer']>, ParentType, ContextType>;
  erpReference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  erpReferences?: Resolver<Maybe<Array<Maybe<ResolversTypes['ErpReference']>>>, ParentType, ContextType>;
  revenueRecognitionReference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceNumber?: Resolver<Maybe<ResolversTypes['ReferenceNumber']>, ParentType, ContextType>;
  invoiceItem?: Resolver<Maybe<ResolversTypes['InvoiceItem']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  customId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType>;
  payments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Payment']>>>, ParentType, ContextType>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  creditNote?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceIdResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoiceId'] = ResolversParentTypes['InvoiceId']> = {
  invoiceId?: Resolver<Maybe<Array<Maybe<ResolversTypes['ID']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoiceItem'] = ResolversParentTypes['InvoiceItem']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  manuscriptId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vatnote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['InvoicingArticle']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  coupons?: Resolver<Maybe<Array<Maybe<ResolversTypes['Coupon']>>>, ParentType, ContextType>;
  waivers?: Resolver<Maybe<Array<Maybe<ResolversTypes['Waiver']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceVatResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoiceVat'] = ResolversParentTypes['InvoiceVat']> = {
  vatPercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vatNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoicingArticleResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoicingArticle'] = ResolversParentTypes['InvoicingArticle']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  journalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  journalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  articleType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorCountry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorSurname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorFirstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  datePublished?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  preprintValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoicingJournalResolvers<ContextType = any, ParentType extends ResolversParentTypes['InvoicingJournal'] = ResolversParentTypes['InvoicingJournal']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  journalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  journalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  issn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publisherId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  publisher?: Resolver<Maybe<ResolversTypes['InvoicingPublisher']>, ParentType, ContextType>;
  publisherName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  userAccount?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  item_reference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  confirmInvoice?: Resolver<ResolversTypes['Payer'], ParentType, ContextType, RequireFields<MutationConfirmInvoiceArgs, 'payer'>>;
  applyCoupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, RequireFields<MutationApplyCouponArgs, never>>;
  updateCoupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, RequireFields<MutationUpdateCouponArgs, never>>;
  updateCatalogItem?: Resolver<Maybe<ResolversTypes['InvoicingJournal']>, ParentType, ContextType, RequireFields<MutationUpdateCatalogItemArgs, never>>;
  createCoupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, RequireFields<MutationCreateCouponArgs, never>>;
  creditCardPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationCreditCardPaymentArgs, 'invoiceId' | 'payerId' | 'paymentMethodId' | 'paymentMethodNonce' | 'amount'>>;
  bankTransferPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationBankTransferPaymentArgs, 'invoiceId' | 'payerId' | 'paymentMethodId' | 'paymentReference' | 'amount' | 'datePaid'>>;
  createCreditNote?: Resolver<ResolversTypes['CreditNote'], ParentType, ContextType, RequireFields<MutationCreateCreditNoteArgs, 'invoiceId'>>;
  createPayPalOrder?: Resolver<ResolversTypes['PayPalOrderId'], ParentType, ContextType, RequireFields<MutationCreatePayPalOrderArgs, 'invoiceId'>>;
  recordPayPalPayment?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationRecordPayPalPaymentArgs, 'invoiceId' | 'orderId'>>;
  generateInvoiceCompensatoryEvents?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationGenerateInvoiceCompensatoryEventsArgs, never>>;
  generateCreditNoteCompensatoryEvents?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationGenerateCreditNoteCompensatoryEventsArgs, never>>;
  generateInvoiceDraftCompensatoryEvents?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationGenerateInvoiceDraftCompensatoryEventsArgs, never>>;
  togglePauseConfirmationReminders?: Resolver<Maybe<ResolversTypes['RemindersStatus']>, ParentType, ContextType, RequireFields<MutationTogglePauseConfirmationRemindersArgs, 'invoiceId' | 'state'>>;
  togglePausePaymentReminders?: Resolver<Maybe<ResolversTypes['RemindersStatus']>, ParentType, ContextType, RequireFields<MutationTogglePausePaymentRemindersArgs, 'invoiceId' | 'state'>>;
};

export type PaginatedCatalogResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCatalog'] = ResolversParentTypes['PaginatedCatalog']> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  catalogItems?: Resolver<Maybe<Array<Maybe<ResolversTypes['InvoicingJournal']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCouponsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCoupons'] = ResolversParentTypes['PaginatedCoupons']> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  coupons?: Resolver<Maybe<Array<Maybe<ResolversTypes['Coupon']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCreditNotesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCreditNotes'] = ResolversParentTypes['PaginatedCreditNotes']> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  creditNotes?: Resolver<Maybe<Array<Maybe<ResolversTypes['CreditNote']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedInvoicesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedInvoices'] = ResolversParentTypes['PaginatedInvoices']> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['Invoice']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedLogsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedLogs'] = ResolversParentTypes['PaginatedLogs']> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  logs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Log']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedPublishersResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedPublishers'] = ResolversParentTypes['PaginatedPublishers']> = {
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  publishers?: Resolver<Maybe<Array<Maybe<ResolversTypes['InvoicingPublisher']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PayPalOrderIdResolvers<ContextType = any, ParentType extends ResolversParentTypes['PayPalOrderId'] = ResolversParentTypes['PayPalOrderId']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Payer'] = ResolversParentTypes['Payer']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['PayerType']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['Address']>, ParentType, ContextType>;
  vatId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Payment'] = ResolversParentTypes['Payment']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PaymentStatus']>, ParentType, ContextType>;
  invoiceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethodId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  foreignPaymentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentProof?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  datePaid?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentMethodResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getCreditNoteByInvoiceId?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType, RequireFields<QueryGetCreditNoteByInvoiceIdArgs, never>>;
  getCreditNoteById?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType, RequireFields<QueryGetCreditNoteByIdArgs, never>>;
  getRecentCreditNotes?: Resolver<Maybe<ResolversTypes['PaginatedCreditNotes']>, ParentType, ContextType, RequireFields<QueryGetRecentCreditNotesArgs, never>>;
  getCreditNoteByReferenceNumber?: Resolver<Maybe<ResolversTypes['CreditNote']>, ParentType, ContextType, RequireFields<QueryGetCreditNoteByReferenceNumberArgs, never>>;
  getPaymentMethods?: Resolver<Maybe<Array<Maybe<ResolversTypes['PaymentMethod']>>>, ParentType, ContextType>;
  getClientToken?: Resolver<Maybe<ResolversTypes['ClientToken']>, ParentType, ContextType>;
  getPublishers?: Resolver<Maybe<ResolversTypes['PaginatedPublishers']>, ParentType, ContextType, RequireFields<QueryGetPublishersArgs, never>>;
  getPublisherDetails?: Resolver<Maybe<ResolversTypes['InvoicingPublisher']>, ParentType, ContextType, RequireFields<QueryGetPublisherDetailsArgs, never>>;
  getPublishersByPublisherId?: Resolver<Maybe<ResolversTypes['PaginatedPublishers']>, ParentType, ContextType, RequireFields<QueryGetPublishersByPublisherIdArgs, never>>;
  getPublisherByName?: Resolver<Maybe<ResolversTypes['InvoicingPublisher']>, ParentType, ContextType, RequireFields<QueryGetPublisherByNameArgs, never>>;
  generateCouponCode?: Resolver<Maybe<ResolversTypes['CouponCode']>, ParentType, ContextType>;
  invoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, RequireFields<QueryInvoiceArgs, never>>;
  invoiceWithAuthorization?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, RequireFields<QueryInvoiceWithAuthorizationArgs, never>>;
  invoiceVat?: Resolver<Maybe<ResolversTypes['InvoiceVat']>, ParentType, ContextType, RequireFields<QueryInvoiceVatArgs, never>>;
  invoices?: Resolver<Maybe<ResolversTypes['PaginatedInvoices']>, ParentType, ContextType, RequireFields<QueryInvoicesArgs, never>>;
  coupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType, RequireFields<QueryCouponArgs, 'couponCode'>>;
  coupons?: Resolver<Maybe<ResolversTypes['PaginatedCoupons']>, ParentType, ContextType, RequireFields<QueryCouponsArgs, never>>;
  invoiceIdByManuscriptCustomId?: Resolver<Maybe<ResolversTypes['InvoiceId']>, ParentType, ContextType, RequireFields<QueryInvoiceIdByManuscriptCustomIdArgs, never>>;
  invoicingJournals?: Resolver<Maybe<ResolversTypes['PaginatedCatalog']>, ParentType, ContextType, RequireFields<QueryInvoicingJournalsArgs, never>>;
  echo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryEchoArgs, never>>;
  remindersStatus?: Resolver<Maybe<ResolversTypes['RemindersStatus']>, ParentType, ContextType, RequireFields<QueryRemindersStatusArgs, 'invoiceId'>>;
  remindersSent?: Resolver<Maybe<Array<Maybe<ResolversTypes['SentReminder']>>>, ParentType, ContextType, RequireFields<QueryRemindersSentArgs, 'invoiceId'>>;
  auditlogs?: Resolver<Maybe<ResolversTypes['PaginatedLogs']>, ParentType, ContextType, RequireFields<QueryAuditlogsArgs, never>>;
  auditlog?: Resolver<Maybe<ResolversTypes['Log']>, ParentType, ContextType, RequireFields<QueryAuditlogArgs, never>>;
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
  type?: Resolver<Maybe<ResolversTypes['ReminderType']>, ParentType, ContextType>;
  toEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  filter?: FilterDirectiveResolver<any, any, ContextType>;
  model?: ModelDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;
