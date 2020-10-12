import { NoOpUseCase } from './../../../core/domain/NoOpUseCase';
import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { InvoiceFinalizedEvent as InvoiceFinalized } from '../domain/events/invoiceFinalized';
import { InvoiceId } from './../domain/InvoiceId';

import { PaymentMethodRepoContract } from '../../payments/repos/paymentMethodRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../payments/repos/paymentRepo';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';
import { InvoiceItemRepoContract } from '../repos';

import { GetPaymentMethodsUseCase } from '../../payments/usecases/getPaymentMethods/GetPaymentMethods';
import { PublishInvoiceFinalizedUsecase } from '../usecases/publishEvents/publishInvoiceFinalized';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';

export class AfterInvoiceFinalized implements HandleContract<InvoiceFinalized> {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private publishInvoiceFinalized:
      | PublishInvoiceFinalizedUsecase
      | NoOpUseCase,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // * Register to the domain event
    DomainEvents.register(
      this.onPublishInvoiceFinalized.bind(this),
      InvoiceFinalized.name
    );
  }

  private async onPublishInvoiceFinalized(
    event: InvoiceFinalized
  ): Promise<void> {
    const { invoice } = event;

    try {
      // TODO move this to usecase
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

      let payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        if (invoice.cancelledInvoiceReference) {
          const invoiceId = InvoiceId.create(
            new UniqueEntityID(invoice.cancelledInvoiceReference)
          ).getValue();
          payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
          if (!payer) {
            throw new Error(`Invoice ${invoice.id.toString()} has no payers.`);
          }
        } else {
          throw new Error(`Invoice ${invoice.id.toString()} has no payers.`);
        }
      }

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no manuscripts associated.`
        );
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

      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        invoice.invoiceId
      );

      const publishResult = await this.publishInvoiceFinalized.execute({
        paymentMethods: paymentMethods.value.getValue(),
        billingAddress,
        invoiceItems,
        manuscript,
        payments,
        invoice,
        payer,
      });

      if (publishResult.isLeft()) {
        throw publishResult.value.errorValue();
      }

      this.loggerService.info(
        `[AfterInvoiceFinalized]: Successfully executed onPublishInvoiceFinalized use case AfterInvoiceFinalized`
      );
    } catch (err) {
      console.error(err);
      this.loggerService.info(
        `[AfterInvoiceFinalized]: Failed to execute onPublishInvoiceFinalized use case AfterInvoiceFinalized. Err: ${err.message}`
      );
    }
  }
}
