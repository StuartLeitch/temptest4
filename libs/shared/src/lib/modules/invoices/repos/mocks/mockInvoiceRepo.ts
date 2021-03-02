import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import type { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceRepoContract } from '../invoiceRepo';
import { InvoiceItemRepoContract } from '../invoiceItemRepo';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { Invoice } from '../../domain/Invoice';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { TransactionId } from '../../../transactions/domain/TransactionId';
import { ErpReferenceRepoContract } from './../../../vendors/repos/ErpReferenceRepo';

export class MockInvoiceRepo
  extends BaseMockRepo<Invoice>
  implements InvoiceRepoContract {
  deletedItems: Invoice[] = [];

  constructor(
    private articleRepo?: ArticleRepoContract,
    private invoiceItemRepo?: InvoiceItemRepoContract,
    private erpReferenceRepo?: ErpReferenceRepoContract
  ) {
    super();
  }

  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    let filterInvoiceById = null;

    filterInvoiceById = this.filterInvoiceById(invoiceId);

    if (!filterInvoiceById) {
      // throw new Error(`No invoice with id ${invoiceId.id.toString()}`);
      return null;
    }

    let erpReferences = [];
    if (this.erpReferenceRepo) {
      const foundReferences = this.erpReferenceRepo.filterBy({
        where: [['entity_id', '=', invoiceId.id.toString()]],
      });

      erpReferences = erpReferences.concat(foundReferences);
    }

    return InvoiceMap.toDomain({
      ...InvoiceMap.toPersistence(filterInvoiceById),
      erpReferences: erpReferences.map((ef) => ({
        entity_id: ef?.entity_id,
        type: ef?.entityType,
        vendor: ef?.vendor,
        attribute: ef?.attribute,
        value: ef?.value,
      })),
    });
  }

  public async getFailedSageErpInvoices(): Promise<Invoice[]> {
    return [];
  }

  public async getFailedNetsuiteErpInvoices(): Promise<Invoice[]> {
    return [];
  }

  public async getInvoicesByCustomId(): Promise<any[]> {
    return [];
  }

  public async getInvoiceByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Invoice> {
    const match = this._items.find((i) =>
      i.invoiceItems
        .getItems()
        .some((ii) => ii.invoiceItemId.equals(invoiceItemId))
    );
    return match ? cloneDeep(match) : null;
  }

  public async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const matches = this._items.filter((i) =>
      i.transactionId.equals(transactionId)
    );
    if (matches.length !== 0) {
      return cloneDeep(matches);
    } else {
      return null;
    }
  }

  async getRecentInvoices(): Promise<any[]> {
    return cloneDeep(this._items);
  }

  public async getInvoiceCollection(): Promise<Invoice[]> {
    return cloneDeep(this._items); // .filter(i => i.invoiceId.id.toString() === invoiceId);
  }

  public async getInvoicePaymentInfo(
    invoiceId: InvoiceId
  ): Promise<InvoicePaymentInfo> {
    const invoice = this._items.find((item) => item.id.equals(invoiceId.id));
    if (!invoice) {
      return null;
    }
    return {
      invoiceId: invoiceId.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      invoiceStatus: invoice.status,
      invoiceNumber: invoice.invoiceNumber,
      invoiceIssueDate: invoice.dateIssued?.toISOString(),
      payerName: '',
      payerEmail: '',
      payerType: '',
      address: '',
      city: '',
      country: '',
      vatRegistrationNumber: '',
      foreignPaymentId: '',
      amount: null,
      paymentDate: invoice.props.dateAccepted?.toISOString(),
      paymentType: '',
    };
  }

  public async assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice> {
    let invoice = await this.getInvoiceById(invoiceId);
    if (invoice.invoiceNumber) {
      return invoice;
    }
    invoice.invoiceNumber = String(this._items.length);
    invoice = await this.save(invoice);
    return invoice;
  }

  public async save(invoice: Invoice): Promise<Invoice> {
    const alreadyExists = await this.exists(invoice);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(invoice);
    }

    return cloneDeep(invoice);
  }

  public async update(invoice: Invoice): Promise<Invoice> {
    const alreadyExists = await this.exists(invoice);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    }

    return cloneDeep(invoice);
  }

  public async delete(invoice: Invoice): Promise<void> {
    this.deletedItems.push(invoice);
  }

  public async restore(invoice: Invoice): Promise<void> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(invoice.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }
  }

  public async exists(invoice: Invoice): Promise<boolean> {
    const found = this._items.filter((i) => this.compareMockItems(i, invoice));
    return found.length !== 0;
  }

  async existsWithId(id: InvoiceId): Promise<boolean> {
    const match = this._items.filter((i) => i.invoiceId.equals(id));

    return match.length !== 0;
  }

  public compareMockItems(a: Invoice, b: Invoice): boolean {
    return a.id.equals(b.id);
  }

  public async *getInvoicesIds(
    ids: string[],
    journalIds: string[],
    omitDeleted: boolean
  ): AsyncGenerator<string, void, undefined> {
    yield* this._items.map((item) => item.id.toString());
    if (!omitDeleted) {
      yield* this.deletedItems.map((item) => item.id.toString());
    }
  }

  async getUnrecognizedNetsuiteErpInvoices(): Promise<InvoiceId[]> {
    const excludedCreditNotes = this.excludeCreditNotesForRevenueRecognition();

    const [
      filterArticlesByNotNullDatePublished,
    ] = await this.articleRepo.filterBy({
      whereNotNull: 'articles.datePublished',
    });

    // * search invoices through invoice items
    const invoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
      filterArticlesByNotNullDatePublished.manuscriptId
    );

    const invoiceQueries = invoiceItems.reduce((aggr, ii) => {
      aggr.push(this.getInvoiceById(ii.invoiceId));
      return aggr;
    }, []);

    const invoicesWithPublishedManuscripts = await Promise.all(invoiceQueries);

    return excludedCreditNotes(invoicesWithPublishedManuscripts);
  }

  async getUnrecognizedNetsuiteErpInvoicesDeprecated(): Promise<InvoiceId[]> {
    const filterInvoicesReadyForRevenueRecognition = this.filterReadyForRevenueRecognition();

    const [filterArticlesByNotNullDatePublished] = this.articleRepo.filterBy({
      whereNotNull: 'articles.datePublished',
    });

    // search invoices through invoice items
    const invoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
      filterArticlesByNotNullDatePublished.manuscriptId
    );

    const invoiceQueries = invoiceItems.reduce((aggr, ii) => {
      aggr.push(this.getInvoiceById(ii.invoiceId));
      return aggr;
    }, []);

    const invoicesWithPublishedManuscripts = await Promise.all(invoiceQueries);

    return filterInvoicesReadyForRevenueRecognition(
      invoicesWithPublishedManuscripts
    );
  }

  public async getUnrecognizedSageErpInvoices(): Promise<InvoiceId[]> {
    return null;
  }

  public async getUnregisteredErpCreditNotes(): Promise<InvoiceId[]> {
    return null;
  }

  public filterReadyForRevenueRecognition() {
    return (items) =>
      this.filterBy(
        {
          whereIn: [['status', ['ACTIVE', 'FINAL']]],
          whereNull: [
            ['cancelledInvoiceReference'],
            ['revenueRecognitionReference'],
          ],
          whereNotNull: ['erpReference'],
          where: [
            ['erpReference', '<>', 'NON_INVOICEABLE'],
            ['erpReference', '<>', 'MigrationRef'],
            ['erpReference', '<>', 'migrationRef'],
          ],
        },
        items
      );
  }

  public filterReadyForRevenueRecognitionThroughErpReferences() {
    return (items) =>
      this.filterBy(
        {
          // whereIn: [['status', ['ACTIVE', 'FINAL']]],
          whereNull: [
            // ['cancelledInvoiceReference'],
            ['revenueRecognitionReference'],
          ],
          whereNotNull: ['erpReference'],
          where: [
            ['type', '=', 'invoice'],
            ['attribute', '=', 'confirmation'],
            // ['value', '<>', 'NON_INVOICEABLE'],
            ['value', '<>', 'MigrationRef'],
            ['value', '<>', 'migrationRef'],
          ],
        },
        items
      );
  }

  public excludeCreditNotesForRevenueRecognition() {
    return (items) =>
      this.filterBy(
        {
          whereIn: [['status', ['ACTIVE', 'FINAL']]],
          whereNull: [
            ['cancelledInvoiceReference'],
            // ['revenueRecognitionReference'],
          ],
          // whereNotNull: ['erpReference'],
          // where: [
          //   ['erpReference', '<>', 'NON_INVOICEABLE'],
          //   ['erpReference', '<>', 'MigrationRef'],
          //   ['erpReference', '<>', 'migrationRef'],
          // ],
        },
        items
      );
  }

  private filterInvoiceById(invoiceId: InvoiceId) {
    const found = this._items.find((item) => item.id.equals(invoiceId.id));

    if (!found) {
      return null;
    }

    return found;
  }

  public filterBy(criteria, items): Invoice[] {
    // * All these must return true
    const conditionsMap = {
      whereNotNull: (value) => value !== null,
      whereNull: (value) => value === null,
      whereNot: (value, valueNot) => value !== valueNot,
      whereIn: (value, ins) => ins.includes(value),
      where: (field, operator, value) => {
        if (operator === '<>') {
          return field !== value;
        }
      },
    };

    for (const [filter, conditions] of Object.entries(criteria)) {
      items = items.filter((i) => {
        let toKeep = true;
        for (const cnd of conditions as any[]) {
          if (!toKeep) {
            break;
          }

          if (filter === 'whereIn' || filter === 'whereNot') {
            const [field, values] = cnd;
            toKeep = conditionsMap[filter].call(i, i[field], values);
          } else if (filter === 'whereNull' || filter === 'whereNotNull') {
            let field = cnd;
            if (Array.isArray(cnd)) {
              [field] = cnd;
            }
            toKeep = conditionsMap[filter].call(i, i[field]);
          } else if (filter === 'where') {
            const [field, operator, value] = cnd;
            toKeep = conditionsMap[filter].call(i, i[field], operator, value);
          } else {
            toKeep = conditionsMap[filter].call(i, cnd);
          }
        }
        return toKeep;
      });
    }

    return items;
  }

  async findByCancelledInvoiceReference(id: InvoiceId): Promise<Invoice> {
    const found = this._items.find(
      (item) => item.cancelledInvoiceReference === id.id.toString()
    );

    if (!found) {
      throw new Error(
        `No invoice with cancelled invoice reference ${id.id.toString()}`
      );
    }

    return found;
  }

  async isInvoiceDeleted(id: InvoiceId): Promise<boolean> {
    const found = this.deletedItems.find((invoice) => invoice.id.equals(id.id));

    return !!found;
  }

  async getInvoicePayments(invoiceId: InvoiceId): Promise<any[]> {
    return [];
  }
}
