import { NoOpUseCase } from './../../../core/domain/NoOpUseCase';
import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceCreated } from '../domain/events/invoiceCreated';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PublishInvoiceCreatedUsecase } from '../usecases/publishEvents/publishInvoiceCreated/publishInvoiceCreated';

import { PayloadBuilder } from '../../../infrastructure/message-queues/payloadBuilder';
import {
  SisifJobTypes,
  JobBuilder,
} from '../../../infrastructure/message-queues/contracts/Job';
import {
  SchedulingTime,
  TimerBuilder,
} from '../../../infrastructure/message-queues/contracts/Time';
import { SchedulerContract } from '../../../infrastructure/scheduler/Scheduler';

export class AfterInvoiceCreatedEvent
  implements HandleContract<InvoiceCreated> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceCreated: PublishInvoiceCreatedUsecase | NoOpUseCase,
    private scheduler: SchedulerContract,
    private confirmationReminderDelay: number,
    private confirmationReminderQueueName: string
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoiceCreatedEvent.bind(this),
      InvoiceCreated.name
    );
  }

  private async onInvoiceCreatedEvent(event: InvoiceCreated): Promise<any> {
    // Get invoice from repo
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);
      if (!invoice) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} does not exist.`
        );
      }

      const invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        event.invoiceId
      );
      if (!invoiceItems || invoiceItems.length === 0) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no invoice items.`
        );
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no manuscripts associated.`
        );
      }

      const result = await this.publishInvoiceCreated.execute({
        invoice,
        invoiceItems,
        manuscript,
      });

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      //* schedule new job
      const jobData = PayloadBuilder.invoiceReminder(
        invoice.id.toString(),
        manuscript.authorEmail,
        manuscript.authorFirstName,
        manuscript.authorSurname
      );

      const newJob = JobBuilder.basic(
        SisifJobTypes.InvoiceConfirmReminder,
        jobData
      );

      const newTimer = TimerBuilder.delayed(
        this.confirmationReminderDelay,
        SchedulingTime.Day
      );

      this.scheduler.schedule(
        newJob,
        this.confirmationReminderQueueName,
        newTimer
      );

      // if (invoice) {
      // Get all payers interested in this invoice
      // for payer in payers
      // Craft and send 'You got an invoice!' email with invoice link included
      // }

      console.log(
        `[AfterInvoiceCreated]: Successfully executed onInvoiceCreatedEvent use case InvoiceCreatedEvent`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceCreated]: Failed to execute onInvoiceCreatedEvent subscription AfterInvoiceCreated. Err: ${err}`
      );
    }
  }
}
