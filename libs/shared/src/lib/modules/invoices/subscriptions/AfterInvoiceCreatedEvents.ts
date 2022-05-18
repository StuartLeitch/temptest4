import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { NoOpUseCase } from './../../../core/domain/NoOpUseCase';
import { Roles } from '../../../domain/authorization';
import { LoggerContract } from '../../../infrastructure/logging';

import { PayloadBuilder } from '../../../infrastructure/message-queues/payloadBuilder';
import { SchedulerContract } from '../../../infrastructure/scheduler/Scheduler';
import {
  SisifJobTypes,
  JobBuilder,
} from '../../../infrastructure/message-queues/contracts/Job';
import {
  SchedulingTime,
  TimerBuilder,
} from '../../../infrastructure/message-queues/contracts/Time';

import { InvoiceCreated } from '../domain/events/invoiceCreated';

import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { InvoiceRepoContract } from '../repos/invoiceRepo';

import { PublishInvoiceCreatedUsecase } from '../usecases/publishEvents/publishInvoiceCreated';

export class AfterInvoiceCreatedEvent
  implements HandleContract<InvoiceCreated>
{
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceCreated: PublishInvoiceCreatedUsecase | NoOpUseCase,
    private scheduler: SchedulerContract,
    private confirmationReminderDelay: number,
    private confirmationReminderQueueName: string,
    private loggerService: LoggerContract
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
    const defaultContext = {
      roles: [Roles.DOMAIN_EVENT_HANDLER],
    };
    // Get invoice from repo
    try {
      const maybeInvoice = await this.invoiceRepo.getInvoiceById(
        event.invoiceId
      );
      if (maybeInvoice.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} does not exist.`
        );
      }

      const invoice = maybeInvoice.value;

      const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        event.invoiceId
      );

      if (maybeInvoiceItems.isLeft()) {
        throw new Error(
          `Invoice items not found for invoice ${event.invoiceId.toString()}`
        );
      }

      const invoiceItems = maybeInvoiceItems.value;

      if (!invoiceItems || invoiceItems.length === 0) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no invoice items.`
        );
      }

      const maybeManuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (maybeManuscript.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no manuscripts associated.`
        );
      }

      const manuscript = maybeManuscript.value;

      const result = await this.publishInvoiceCreated.execute(
        {
          invoice,
          invoiceItems,
          manuscript,
        },
        defaultContext
      );

      if (result.isLeft()) {
        throw new Error(result.value.message);
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

      this.loggerService.info(
        `[AfterInvoiceCreated]: Successfully executed onInvoiceCreatedEvent use case InvoiceCreatedEvent`
      );
    } catch (err) {
      this.loggerService.error(
        `[AfterInvoiceCreated]: Failed to execute onInvoiceCreatedEvent subscription AfterInvoiceCreated. Err: ${err}`
      );
    }
  }
}
