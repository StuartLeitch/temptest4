import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

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
    private publishInvoicePaid: PublishInvoicePaidUsecase,
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
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);
      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute({
          invoiceId: invoice.invoiceId.id.toString(),
        });
        if (resp.isLeft()) {
          throw new Error(
            `Invoice ${invoice.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value.getValue();
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      const payerUsecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );
      const maybePayerResponse = await payerUsecase.execute({
        invoiceId: invoice.id.toString(),
      });
      if (maybePayerResponse.isLeft()) {
        throw new Error(`No payer for invoice ${invoice.id.toString()} found`);
      }

      const paymentMethodsUsecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );
      const paymentMethods = await paymentMethodsUsecase.execute();

      if (paymentMethods.isLeft()) {
        throw new Error(
          `Payment methods could not be accessed: ${
            paymentMethods.value.errorValue().message
          }`
        );
      }

      const payer = maybePayerResponse.value.getValue();

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        invoice.invoiceId
      );

      const publishResult = await this.publishInvoicePaid.execute({
        paymentMethods: paymentMethods.value.getValue(),
        invoiceItems,
        billingAddress,
        manuscript,
        payments,
        invoice,
        payer,
      });
      if (publishResult.isLeft()) {
        throw publishResult.value.errorValue();
      }
      console.log(
        `[AfterInvoicePaid]: Successfully executed onInvoicePaidEvent use case InvoicePaidEvent`
      );
    } catch (err) {
      console.log(
        `[AfterInvoicePaid]: Failed to execute onInvoicePaidEvent use case InvoicePaidEvent. Err: ${err}`
      );
    }
  }
}
