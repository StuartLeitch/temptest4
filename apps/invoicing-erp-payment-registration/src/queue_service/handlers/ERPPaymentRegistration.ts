import {
  UniqueEntityID,
  UnexpectedError,
  Invoice,
  PaymentId,
  PaymentStatus,
  ErpReferenceMap,
  Manuscript,
  CatalogItem,
  JournalId,
  RegisterPaymentRequest,
  RegisterPaymentResponse
} from '@hindawi/shared';

import { Context } from '../../builders';
import { EventHandler } from '../event-handler';

const ERP_PAYMENT_REGISTRATION = 'ERPPaymentRegistration';

export const ERPPaymentRegistration: EventHandler<any> = {
  event: ERP_PAYMENT_REGISTRATION,
  handler(context: Context) {
    return async (data: any): Promise<void> => {
      const {
        repos: {
          payment: paymentRepo,
          paymentMethod: paymentMethodRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          payer: payerRepo,
          manuscript: manuscriptRepo,
          catalog: catalogRepo,
          erpReference: erpReferenceRepo
        },
        services: { logger , erp: { netsuite } },
      } = context;
      const { paymentId } = data;

      logger.setScope(`ERP payment registration event: ${ERP_PAYMENT_REGISTRATION}`);
      logger.info(`Register payment`, paymentId);

      console.info(context);

      let invoice: Invoice;
      try {
        // * Get payment details
        const maybePayment = await paymentRepo.getPaymentById(
          PaymentId.create(new UniqueEntityID(paymentId))
        );

        if (maybePayment.isLeft()) {
          throw new UnexpectedError(new Error(maybePayment.value.message));
        }

        const payment = maybePayment.value;
        logger.debug('payment: ', payment);

        if (payment.status !== PaymentStatus.COMPLETED) {
          return;
        }

        // * Get invoice payments
        const maybeInvoicePayments = await invoiceRepo.getInvoicePayments(
          payment.invoiceId
        );

        if (maybeInvoicePayments.isLeft()) {
          throw new UnexpectedError(new Error(maybeInvoicePayments.value.message));
        }

        const invoicePayments = maybeInvoicePayments.value;
        logger.debug('invoicePayments: ', invoicePayments);

        // * Get invoice details
        const maybeInvoice = await invoiceRepo.getInvoiceById(
          payment.invoiceId
        );

        if (maybeInvoice.isLeft()) {
          throw new UnexpectedError(new Error(maybeInvoice.value.message));
        }

        const invoice = maybeInvoice.value;

        logger.debug('invoice: ', invoice);

        let invoiceItems = invoice?.invoiceItems?.currentItems;

        if (invoiceItems.length === 0) {
          const maybeItems = await invoiceItemRepo.getItemsByInvoiceId(
            invoice.invoiceId
          );

          if (maybeItems.isLeft()) {
            throw new Error(maybeItems.value.message);
          }

          const items = maybeItems.value;
          logger.debug('invoice items', items);

          if (items.length === 0) {
            throw new Error(
              `Invoice ${invoice.id.toString()} does not have invoice items.`
            );
          }

          for (const item of items) {
            const [maybeCoupons, maybeWaivers] = await Promise.all([
              couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
              waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
            ]);

            if (maybeCoupons.isLeft()) {
              throw new Error(maybeCoupons.value.message);
            }

            if (maybeWaivers.isLeft()) {
              throw new Error(maybeWaivers.value.message);
            }

            item.addAssignedCoupons(maybeCoupons.value);
            item.addAssignedWaivers(maybeWaivers.value);
          }

          // * Populate invoiceItem with data retrieved from the repo
          invoiceItems = items;
        }

        if (invoiceItems.length === 0) {
          throw new Error(`Invoice ${invoice.id} has no invoice items.`);
        }

        invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));
        logger.info(
          'invoice items',
          invoiceItems
        );

        // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
        if (invoice.getInvoiceTotal() <= 0) {
          const maybeNonInvoiceableErpReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: this.erpService.vendorName,
            attribute:
              this.erpService?.referenceMappings?.invoiceConfirmation ||
              'invoice',
            value: 'NON_INVOICEABLE',
          });

          if (maybeNonInvoiceableErpReference.isLeft()) {
            throw new UnexpectedError(
              new Error(maybeNonInvoiceableErpReference.value.message)
            );
          }

          const nonInvoiceableErpReference =
            maybeNonInvoiceableErpReference.value;

          const maybeResult = await this.erpReferenceRepo.save(
            nonInvoiceableErpReference
          );

          if (maybeResult.isLeft()) {
            throw new UnexpectedError(new Error(maybeResult.value.message));
          }

          return;
        }

        // * Get payment methods
        const maybePaymentMethods = await paymentMethodRepo.getPaymentMethods();

        if (maybePaymentMethods.isLeft()) {
          throw new Error(maybePaymentMethods.value.message);
        }

        const paymentMethods = maybePaymentMethods.value;
        logger.debug('paymentMethods', paymentMethods);

        // * Get payer details
        const maybePayer = await payerRepo.getPayerByInvoiceId(
          invoice.invoiceId
        );

        if (maybePayer.isLeft()) {
          throw new Error(maybePayer.value.message);
        }

        const payer = maybePayer.value;
        logger.debug('payer', payer);

        if (!payer) {
          throw new Error(`Invoice ${invoice.id} has no payers.`);
        }

        // * Get manuscript details
        const APCs = invoiceItems.filter(
          (invoiceItem) => invoiceItem.type === 'APC'
        );

        const manuscripts: Manuscript[] = [];

        for (const invoiceItem of APCs) {
          const maybeManuscript = await manuscriptRepo.findById(
            invoiceItem.manuscriptId
          );

          if (maybeManuscript.isLeft()) {
            throw new Error(maybeManuscript.value.message);
          }

          manuscripts.push(maybeManuscript.value);
        }

        logger.debug('manuscripts', manuscripts);

        let [manuscript] = manuscripts;

        if (!manuscript) {
          throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
        }

        // * Get catalog details
        let catalog: CatalogItem;
        try {
          const maybeCatalog = await catalogRepo.getCatalogItemByJournalId(
            JournalId.create(new UniqueEntityID(manuscript.journalId))
          );

          if (maybeCatalog.isLeft()) {
            throw new Error(maybeCatalog.value.message);
          }

          catalog = maybeCatalog.value;

          if (!catalog) {
            throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
          }

          logger.debug('catalog', catalog);
        } catch (err) {
          return err;
        }

        try {
          const erpData: RegisterPaymentRequest = {
            invoice,
            payer,
            paymentMethods,
            payment,
            total: invoice.invoiceTotal,
            manuscript: manuscript,
            invoicePayments,
          };

          let erpResponse: RegisterPaymentResponse;
          try {
            erpResponse = await netsuite.registerPayment(erpData);

            if (erpResponse) {
              logger.info(
                `Updating invoice ${invoice.id.toString()}: paymentReference -> ${JSON.stringify(
                  erpResponse
                )}`
              );
            }
          } catch (err) {
            throw new UnexpectedError(err, err.toString());
          }

          logger.info('final payment', payment);
          // await paymentRepo.updatePayment(payment);


          if (erpResponse) {
            const erpReference = ErpReferenceMap.toDomain({
              entity_id: payment.paymentId.id.toString(),
              type: 'payment',
              vendor: 'netsuite',
              attribute:
                netsuite?.referenceMappings?.paymentConfirmation ||
                'payment',
              value: erpResponse.paymentReference,
            });

            if (erpReference.isLeft()) {
              throw new UnexpectedError(new Error(erpReference.value.message));
            }

            const maybeResult = await erpReferenceRepo.save(
              erpReference.value
            );

            if (maybeResult.isLeft()) {
              throw new UnexpectedError(new Error(maybeResult.value.message));
            }
          }

          // * the end
        } catch (err) {
          throw new UnexpectedError(err, err.toString());
        }


      } catch (err) {
        throw new UnexpectedError(err, err.toString());
      }
    };
  },
};
