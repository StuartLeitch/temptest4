import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { NoOpUseCase } from './../../../core/domain/NoOpUseCase';
import { Roles } from '../../../domain/authorization';

import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { InvoiceFinalizedEvent as InvoiceFinalized } from '../domain/events/invoiceFinalized';

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
import { Payer } from '../../payers/domain/Payer';

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
    private loggerService: LoggerContract,
    private erpRegister: any,
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

    const usecaseContext = { roles: [Roles.DOMAIN_EVENT_HANDLER] };

    try {
      // TODO move this to usecase
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

      let payer: Payer;
      let maybePayer = await this.payerRepo.getPayerByInvoiceId(
        invoice.invoiceId
      );
      if (maybePayer.isLeft()) {
        throw new Error(`Invoice ${invoice.id.toString()} has no payers.`);
      } else {
        payer = maybePayer.value;
      }

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      if (billingAddress.isLeft()) {
        throw new Error(
          `Billing address could not be accessed: ${billingAddress.value.message}`
        );
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (manuscript.isLeft()) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no manuscripts associated.`
        );
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

      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        invoice.invoiceId
      );

      if (payments.isLeft()) {
        throw new Error(
          `Payments could not be accessed: ${payments.value.message}`
        );
      }

      const publishResult = await this.publishInvoiceFinalized.execute(
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

      // * Register this invoice ERP
      const erpRegistrationRequest = JSON.stringify({ invoiceId: invoice.invoiceId.toString() });
      await this.erpRegister.publish(erpRegistrationRequest);

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
