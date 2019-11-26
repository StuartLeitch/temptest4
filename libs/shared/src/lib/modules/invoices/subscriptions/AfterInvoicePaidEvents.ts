import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoicePaidEvent } from '../domain/events/invoicePaid';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos';
import {
  PayerRepoContract,
  ArticleRepoContract,
  PaymentRepoContract,
  PaymentMethodRepoContract
} from '@hindawi/shared';
import { PublishInvoicePaid } from '../usecases/PublishInvoicePaid';
import { PaymentMethod } from '../../payments/domain/PaymentMethod';

export class AfterInvoicePaidEvent implements HandleContract<InvoicePaidEvent> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private payerRepo: PayerRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private paymentRepo: PaymentRepoContract,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private publishInvoicePaid: PublishInvoicePaid
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoicePaidEvent.bind(this),
      InvoicePaidEvent.name
    );
  }

  private async onInvoicePaidEvent(event: InvoicePaidEvent): Promise<any> {
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);
      let invoiceItems = invoice.invoiceItems.currentItems;
      if (invoiceItems.length === 0) {
        invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
          invoice.invoiceId
        );
      }
      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      const payment = await this.paymentRepo.getPaymentById(event.paymentId);
      if (!payment) {
        throw new Error(`Invoice ${invoice.id} has no payment associated.`);
      }

      const paymentMethod = await this.paymentMethodRepo.getPaymentMethodById(payment.paymentMethodId);
      if (!payment) {
        throw new Error(`Payment ${payment.id} has no payment method associated.`);
      }

      this.publishInvoicePaid.execute(
        invoice,
        invoiceItems,
        manuscript,
        payment,
        paymentMethod,
        payer
      );
      console.log(
        `[AfterInvoiceActivated]: Successfully executed onInvoicePaidEvent use case InvoicePaidEvent`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceActivated]: Failed to execute onInvoicePaidEvent use case InvoicePaidEvent. Err: ${err}`
      );
    }
  }
}
