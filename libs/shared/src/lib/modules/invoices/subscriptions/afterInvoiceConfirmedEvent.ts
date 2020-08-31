import { NoOpUseCase } from '../../../core/domain/NoOpUseCase';
import { PayloadBuilder } from '../../../infrastructure/message-queues/payloadBuilder';
import { SchedulerContract } from '../../../infrastructure/scheduler/Scheduler';
import { LoggerContract } from '../../../infrastructure/logging/Logger';
import {
  SisifJobTypes,
  JobBuilder,
} from '../../../infrastructure/message-queues/contracts/Job';
import {
  SchedulingTime,
  TimerBuilder,
} from '../../../infrastructure/message-queues/contracts/Time';

import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';

import { InvoiceConfirmed } from '../domain/events/invoiceConfirmed';

import { Payer } from '../../payers/domain/Payer';
import { Invoice } from '../domain/Invoice';

import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';
import { InvoiceItemRepoContract } from '../repos';

import { PublishInvoiceConfirmedUsecase } from '../usecases/publishEvents/publishInvoiceConfirmed';
import { PublishInvoiceToErpUsecase } from '../usecases/publishInvoiceToErp/publishInvoiceToErp';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';

export class AfterInvoiceConfirmed implements HandleContract<InvoiceConfirmed> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceConfirmed: PublishInvoiceConfirmedUsecase,
    private invoiceToErpUsecase: PublishInvoiceToErpUsecase | NoOpUseCase,
    private scheduler: SchedulerContract,
    private loggerService: LoggerContract,
    private creditControlReminderDelay: number,
    private paymentReminderDelay: number,
    private jobQueue: string
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // * Register to the domain event
    DomainEvents.register(
      this.onPublishInvoiceConfirmed.bind(this),
      InvoiceConfirmed.name
    );
  }

  private async onPublishInvoiceConfirmed(
    event: InvoiceConfirmed
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

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id.toString()} has no payers.`);
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

      const publishResult = await this.publishInvoiceConfirmed.execute({
        billingAddress,
        invoiceItems,
        manuscript,
        invoice,
        payer,
      });

      if (publishResult.isLeft()) {
        throw publishResult.value.errorValue();
      }

      this.loggerService.info(
        `[AfterInvoiceActivated]: Successfully executed onPublishInvoiceActivated use case AfterInvoiceActivated`
      );

      try {
        await this.scheduleReminders(invoice, payer);
      } catch (error) {
        this.loggerService.info(
          `[AfterInvoiceActivated]: Failed to schedule reminders. Err: ${JSON.stringify(
            error
          )}`
        );
      }
    } catch (err) {
      this.loggerService.info(
        `[AfterInvoiceActivated]: Failed to execute onPublishInvoiceActivated use case AfterInvoiceActivated. Err: ${err.message}`
      );
    }

    try {
      const resp = await this.invoiceToErpUsecase.execute({
        invoiceId: invoice.id.toString(),
      });
      if (resp.isLeft()) {
        throw resp.value;
      } else {
        this.loggerService.info(
          `[AfterInvoiceActivated]: Successfully executed invoiceToErpUsecase use case AfterInvoiceActivated`
        );
      }
    } catch (error) {
      this.loggerService.info(
        `[AfterInvoiceActivated]: Failed to execute invoiceToErpUsecase use case AfterInvoiceActivated. Err: ${error.message}`
      );
    }
  }

  private async scheduleReminders(invoice: Invoice, payer: Payer) {
    const jobData = PayloadBuilder.invoiceReminder(
      invoice.id.toString(),
      payer.email.value,
      payer.name.value,
      ''
    );
    const jobPaymentReminder = JobBuilder.basic(
      SisifJobTypes.InvoicePaymentReminder,
      jobData
    );
    const jobCreditControlReminder = JobBuilder.basic(
      SisifJobTypes.InvoiceCreditControlReminder,
      jobData
    );
    const creditControlTimer = TimerBuilder.delayed(
      this.creditControlReminderDelay,
      SchedulingTime.Day
    );
    const paymentTimer = TimerBuilder.delayed(
      this.paymentReminderDelay,
      SchedulingTime.Day
    );

    await this.scheduler.schedule(
      jobCreditControlReminder,
      this.jobQueue,
      creditControlTimer
    );
    await this.scheduler.schedule(
      jobPaymentReminder,
      this.jobQueue,
      paymentTimer
    );
  }
}
