import { Service } from 'typedi';
import uuid from 'uuid';

// import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerContract } from '../../decorators/Logger';
import { Invoice, InvoiceId } from '@hindawi/shared';
import { KnexInvoiceRepo } from './../../../../../libs/shared/src/lib/modules/invoices/repos/implementations/knexInvoiceRepo';

// import { events } from '../subscribers/events';

@Service()
export class InvoiceService {
  constructor(
      private invoiceRepo: KnexInvoiceRepo,
      // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
      @Logger(__filename) private log: LoggerContract
  ) { }

  public find(): Promise<Invoice[]> {
    this.log.info('Find all invoices');
    return null;
    // return this.invoiceRep.getInvoiceById();
  }

  public findById(invoiceId: InvoiceId): Promise<Invoice[]> {
      this.log.info('Find all invoices with id', invoiceId.id.toString());
      return null;
      // return this.invoiceRep.find({
      //     where: {
      //         userId: user.id,
      //     },
      // });
  }

  public findOne(id: string): Promise<Invoice | undefined> {
      this.log.info('Find all Invoices');
      return null;
      // return this.invoiceRepo.findOne({ id });
  }

  public async create(invoice: Invoice): Promise<Invoice> {
      this.log.info('Create a new Invoice => ', invoice.toString());
      return null;
      // invoice.id = uuid.v1();
      // const newInvoice = await this.invoiceRepo.save(invoice);
      // this.eventDispatcher.dispatch(events.invoice.created, newInvoice);
      // return newInvoice;
  }

  public update(id: string, invoice: Invoice): Promise<Invoice> {
      this.log.info('Update an Invoice');
      // invoice.id = id;
      return this.invoiceRepo.save(invoice);
  }

  public async delete(id: string): Promise<void> {
      this.log.info('Delete an Invoice');
      // await this.invoiceRepo.delete(id);
      return;
  }
}
