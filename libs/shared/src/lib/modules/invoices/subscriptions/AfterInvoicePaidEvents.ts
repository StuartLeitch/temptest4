import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../infrastructure/logging/Logger';
import { NoOpUseCase } from './../../../core/domain/NoOpUseCase';
import { Roles } from '../../../domain/authorization';

import { InvoicePaymentAddedEvent } from '../domain/events/invoicePaymentAdded';

import { PaymentMethodRepoContract } from '../../payments/repos/paymentMethodRepo';
import { ArticleRepoContract } from '../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../payments/repos/paymentRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';

import { GetPayerDetailsByInvoiceIdUsecase } from '../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { PublishInvoicePaidUsecase } from '../usecases/publishEvents/publishInvoicePaid';
import { GetPaymentMethodsUseCase } from '../../payments/usecases/getPaymentMethods';

export class AfterInvoicePaidEvent
  implements HandleContract<InvoicePaymentAddedEvent> {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private publishInvoicePaid: PublishInvoicePaidUsecase | NoOpUseCase,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onInvoicePaidEvent.bind(this),
      InvoicePaymentAddedEvent.name
    );
  }

  private async onInvoicePaidEvent(
    event: InvoicePaymentAddedEvent
  ): Promise<any> {
    const usecaseContext = { roles: [Roles.DOMAIN_EVENT_HANDLER] };

    try {
      const maybeInvoice = await this.invoiceRepo.getInvoiceById(
        event.invoiceId
      );

      if (maybeInvoice.isLeft()) {
        throw new Error(`Invoice not found ${event.invoiceId}`);
      }

      const invoice = maybeInvoice.value;

      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute(
          {
            invoiceId: invoice.invoiceId.id.toString(),
          },
          usecaseContext
        );
        if (resp.isLeft()) {
          throw new Error(
            `Invoice ${invoice.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value;
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (manuscript.isLeft()) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no manuscripts associated.`
        );
      }

      const payerUsecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );
      const maybePayerResponse = await payerUsecase.execute(
        {
          invoiceId: invoice.id.toString(),
        },
        usecaseContext
      );
      if (maybePayerResponse.isLeft()) {
        throw new Error(`No payer for invoice ${invoice.id.toString()} found`);
      }

      const paymentMethodsUsecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );
      const paymentMethods = await paymentMethodsUsecase.execute(
        null,
        usecaseContext
      );

      if (paymentMethods.isLeft()) {
        throw new Error(
          `Payment methods could not be accessed: ${paymentMethods.value.message}`
        );
      }

      const payer = maybePayerResponse.value;

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      if (billingAddress.isLeft()) {
        throw new Error(
          `Billing address could not be accessed: ${billingAddress.value.message}`
        );
      }

      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        invoice.invoiceId
      );

      if (payments.isLeft()) {
        throw new Error(
          `Payments could not be accessed: ${payments.value.message}`
        );
      }

      invoice.addItems(invoiceItems);

      const publishResult = await this.publishInvoicePaid.execute(
        {
          paymentMethods: paymentMethods.value,
          billingAddress: billingAddress.value,
          manuscript: manuscript.value,
          payments: payments.value,
          invoiceItems,
          invoice,
          payer,
        },
        usecaseContext
      );

      if (publishResult.isLeft()) {
        throw publishResult.value;
      }

      console.log(
        `[AfterInvoicePaid]: Successfully executed onInvoicePaidEvent use case InvoicePaidEvent`
      );
    } catch (err) {
      console.error(err);
      console.log(
        `[AfterInvoicePaid]: Failed to execute onInvoicePaidEvent use case InvoicePaidEvent. Err: ${err.message}`
      );
    }
  }
}
