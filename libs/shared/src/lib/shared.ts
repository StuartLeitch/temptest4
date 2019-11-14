// * Export Core Subdomain
export * from './core/domain/UniqueEntityID';
export * from './infrastructure/Repo';

// * Export Shared Subdomain
export * from './domain/Amount';
export * from './domain/File';
export * from './domain/Name';
export * from './domain/Email';
export * from './domain/PhoneNumber';
export * from './domain/authorization';

// * Export Address Subdomain
export * from './modules/addresses/repos/addressRepo';
export * from './modules/addresses/usecases/getAddress/getAddress';
export * from './modules/addresses/repos/implementations/knexAddressRepo';
export * from './modules/addresses/mappers/AddressMap'

// * Export Article Subdomain
export * from './modules/articles/domain/Article';
// export * from './modules/articles/dtos/ArticleDTO';
export * from './modules/articles/mappers/ArticleMap';
export * from './modules/articles/domain/ArticleId';
// export * from './modules/articles/domain/Price';
// export * from './modules/articles/domain/PriceId';
// export * from './modules/articles/domain/PriceValue';
// export * from './modules/articles/repos';
// export * from './modules/articles/mappers/ArticleMap';
// export * from './modules/articles/repos/priceRepo';
// export * from './modules/articles/mappers/PriceMap';

// * Export Transaction Subdomain
export * from './modules/transactions/domain/Transaction';
export * from './modules/transactions/domain/TransactionId';
// export * from './modules/transactions/domain/TransactionAmount';
// // export * from './transactions/domain/events/transactionCreatedEvent';
export * from './modules/transactions/repos';
// // export * from './transactions/repos/transactionJsonRepo';
// export * from './modules/transactions/usecases/getTransactions/getTransactions';
// export * from './modules/transactions/usecases/getTransaction/getTransaction';
// export * from './modules/transactions/usecases/createTransaction/createTransaction';
// // export * from './transactions/subscribers/AfterTransactionCreatedEvents';
export * from './modules/transactions/mappers/TransactionMap';

// * Export Invoice Subdomain
export * from './modules/invoices/domain/Invoice';
export * from './modules/invoices/domain/InvoiceId';
export * from './modules/invoices/domain/InvoiceItem';
export * from './modules/invoices/domain/InvoiceItemId';
export * from './modules/invoices/domain/ManuscriptId';
// // export * from './invoices/domain/events/invoiceSentEvent';
export * from './modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails';
export * from './modules/invoices/usecases/getInvoiceDetails/getInvoiceDetailsDTO';
export * from './modules/invoices/usecases/deleteInvoice/deleteInvoice';
export * from './modules/invoices/repos';
export * from './modules/invoices/usecases/createInvoice/createInvoice';
export * from './modules/invoices/usecases/createInvoice/createInvoiceDTO';
// export * from './invoices/usecases/sendInvoice/sendInvoice';
// // export * from './invoices/subscribers/AfterInvoiceSentEvents';
export * from './modules/invoices/mappers/InvoiceMap';
// export * from './modules/invoices/dtos/InvoiceDTO';
export * from './modules/invoices/mappers/InvoiceItemMap';

// export {
//   PoliciesRegister as InvoicePoliciesRegister
// } from './modules/invoices/domain/policies/PoliciesRegister';
// export * from './modules/invoices/domain/policies/UKVATHardCopyPolicy';
// export * from './modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';
// export * from './modules/invoices/domain/policies/VATTreatmentPublicationNotOwnedPolicy';

// * Export Payer Subdomain
export * from './modules/payers/domain/Payer';
export * from './modules/payers/domain/PayerId';
export * from './modules/payers/domain/PayerName';
export * from './modules/payers/domain/PayerTitle';
export * from './modules/payers/repos/payerRepo';
export * from './modules/payers/repos/implementations/knexPayerRepo';
export * from './modules/payers/mapper/Payer';
export * from './modules/payers/usecases/updatePayer/updatePayer';

// * Export Address Subdomain
export * from './modules/addresses/domain/AddressId';
export * from './modules/addresses/domain/Address';

// * Export Catalog Subdomain
export {CatalogItem} from './modules/journals/domain/CatalogItem';
export * from './modules/journals/domain/JournalId';
export * from './modules/journals/repos';
export * from './modules/journals/mappers/CatalogMap';
// export * from './modules/catalogs/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogUseCase';
// export * from './modules/catalogs/usecases/catalogItems/getAllCatalogItems/getAllCatalogItemsUseCase';

// // * Export User Subdomain
export {Roles} from './modules/users/domain/enums/Roles';

// * Export Payments Subdomain
export * from './modules/payments/domain/Payment';
export * from './modules/payments/domain/PaymentId';
export {PaymentMethod} from './modules/payments/domain/PaymentMethod';
export * from './modules/payments/domain/PaymentMethodId';
export * from './modules/payments/domain/contracts/PaymentModel';
export * from './modules/payments/domain/strategies/PaymentFactory';
export * from './modules/payments/domain/strategies/PaymentStrategy';
export * from './modules/payments/domain/strategies/CreditCardPayment';
export * from './modules/payments/domain/strategies/CreditCard';
export * from './modules/payments/usecases/payment/recordPayment';
export * from './modules/payments/mapper/Payment';
export * from './modules/payments/mapper/PaymentMethod';
export * from './modules/payments/repos';

export * from './modules/payments/domain/events/paymentDone';

// * Export Waiver, Coupon Subdomain
// export * from './domain/reductions/ReductionFactory';
// export * from './domain/reductions/Coupon';
// export {
//   PoliciesRegister as ReductionsPoliciesRegister
// } from './domain/reductions/policies/PoliciesRegister';
// export * from './domain/reductions/policies/WaivedCountryPolicy';
// export * from './domain/reductions/policies/SanctionedCountryPolicy';
export * from './domain/reductions/repos/implementations/knexWaiverRepo';

// export * from './modules/coupons/mappers/CouponMap';
// export * from './modules/coupons/repos';

// * Export Author Subdomain
export * from './modules/authors/domain/Author';

// * Export user Subdomain
export * from './modules/users/domain/User';
export * from './modules/users/domain/UserId';
export * from './modules/users/mappers/UserMap';

// ? Should we export this
// * Infra
// export * from './infra/http/app';
export {
  BraintreeGateway
} from './modules/payments/infrastructure/gateways/braintree/gateway';
export * from './infrastructure/database/knex';
// export {Emailer} from './infrastructure/communication-channels';

// ? Should we export this
// * Redux Stuff
// export * from './infrastructure/frameworks/redux';
// export * from './infrastructure/state-management/redux';
export * from './domain/reductions/repos/implementations/knexWaiverRepo';
export * from './domain/services/VATService';
export * from './domain/services/WaiverService';
