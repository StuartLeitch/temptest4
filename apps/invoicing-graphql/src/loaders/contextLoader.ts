import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import {
  KnexPaymentMethodRepo,
  KnexAddressRepo,
  KnexArticleRepo,
  KnexInvoiceItemRepo,
  KnexInvoiceRepo,
  KnexTransactionRepo,
  KnexPaymentRepo,
  KnexPayerRepo,
  KnexWaiverRepo,
  KnexCatalogRepo,
  VATService,
  WaiverService,
  EmailService,
  KnexEditorRepo
} from '@hindawi/shared';

export const contextLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');

    const repos = {
      address: new KnexAddressRepo(db),
      catalog: new KnexCatalogRepo(db),
      invoice: new KnexInvoiceRepo(db),
      invoiceItem: new KnexInvoiceItemRepo(db),
      transaction: new KnexTransactionRepo(db),
      payer: new KnexPayerRepo(db),
      payment: new KnexPaymentRepo(db),
      paymentMethod: new KnexPaymentMethodRepo(db),
      waiver: new KnexWaiverRepo(db),
      manuscript: new KnexArticleRepo(db),
      editor: new KnexEditorRepo(db)
    };

    const services = {
      // checkoutService: new CheckoutService(),
      // authService: new AuthService(config),
      vatService: new VATService(),
      waiverService: new WaiverService(),
      // payPalService: () => makePayPal(config),
      emailService: new EmailService()
      // exchangeRateService: new ExchangeRateService(),
      // erpService: new ErpService(config)
    };

    const context = {
      repos,
      services
    };

    settings.setData('context', context);
  }
};
