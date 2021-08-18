import { cloneDeep } from 'lodash';

import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { TransactionId } from '../../../transactions/domain/TransactionId';
import { InvoicePaginated } from '../../domain/InvoicesPaginated';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

import { InvoiceMap } from '../../mappers/InvoiceMap';

import { ErpReferenceRepoContract } from './../../../vendors/repos/ErpReferenceRepo';
import type { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { InvoiceItemRepoContract } from '../invoiceItemRepo';
import { InvoiceRepoContract } from '../invoiceRepo';

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

  public async getInvoiceById(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const filterInvoiceById = this.filterInvoiceById(invoiceId);

    if (!filterInvoiceById) {
      return right(null);
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

  public async getFailedSageErpInvoices(): Promise<
    Either<GuardFailure | RepoError, Invoice[]>
  > {
    return right([]);
  }

  public async getFailedNetsuiteErpInvoices(): Promise<
    Either<GuardFailure | RepoError, Invoice[]>
  > {
    return right([]);
  }

  public async getInvoicesByCustomId(): Promise<
    Either<GuardFailure | RepoError, Invoice[]>
  > {
    return right([]);
  }

  public async getInvoiceByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const match = this._items.find((i) =>
      i.invoiceItems
        .getItems()
        .some((ii) => ii.invoiceItemId.equals(invoiceItemId))
    );

    if (!match) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoiceItemId.toString())
      );
    }

    return right(cloneDeep(match));
  }

  public async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Either<GuardFailure | RepoError, Invoice[]>> {
    const matches = this._items.filter((i) =>
      i.transactionId.equals(transactionId)
    );
    if (matches.length !== 0) {
      return right(cloneDeep(matches));
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'invoices',
          transactionId.toString()
        )
      );
    }
  }

  async getRecentInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoicePaginated>
  > {
    return right({
      totalCount: this._items.length.toString(),
      invoices: cloneDeep(this._items),
    });
  }

  public async getInvoiceCollection(): Promise<Invoice[]> {
    return cloneDeep(this._items); // .filter(i => i.invoiceId.id.toString() === invoiceId);
  }

  public async getInvoicePaymentInfo(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, InvoicePaymentInfo>> {
    const invoice = this._items.find((item) => item.id.equals(invoiceId.id));
    if (!invoice) {
      return null;
    }
    return right({
      invoiceId: invoiceId.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      invoiceStatus: invoice.status,
      invoiceNumber: Number(invoice.invoiceNumber),
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
    });
  }

  public async getCurrentInvoiceNumber(): Promise<number> {
    return Number(this._items.length) + 1;
  }

  public async save(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const maybeAlreadyExists = await this.exists(invoice);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

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

    return right(cloneDeep(invoice));
  }

  public async update(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const maybeAlreadyExists = await this.exists(invoice);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    }

    return right(cloneDeep(invoice));
  }

  public async delete(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, void>> {
    this.deletedItems.push(invoice);
    return right(null);
  }

  public async restore(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(invoice.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }

    return right(null);
  }

  public async exists(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) => this.compareMockItems(i, invoice));
    return right(found.length !== 0);
  }

  async existsWithId(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const match = this._items.filter((i) => i.invoiceId.equals(id));

    return right(match.length !== 0);
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

  async getUnrecognizedNetsuiteErpInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    const excludedCreditNotes = this.excludeCreditNotesForRevenueRecognition();

    const [
      filterArticlesByNotNullDatePublished,
    ] = await this.articleRepo.filterBy({
      whereNotNull: 'articles.datePublished',
    });

    // * search invoices through invoice items
    const maybeInvoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
      filterArticlesByNotNullDatePublished.manuscriptId
    );

    if (maybeInvoiceItems.isLeft()) {
      return left(maybeInvoiceItems.value);
    }
    const invoiceItems = maybeInvoiceItems.value;

    const invoiceQueries = invoiceItems.map((ii) =>
      this.getInvoiceById(ii.invoiceId)
    );

    const invoicesWithPublishedManuscripts = flatten(
      await Promise.all(invoiceQueries)
    );

    if (invoicesWithPublishedManuscripts.isLeft()) {
      return left(
        RepoError.fromDBError(
          new Error(invoicesWithPublishedManuscripts.value.message)
        )
      );
    }

    return right(excludedCreditNotes(invoicesWithPublishedManuscripts.value));
  }

  async getUnrecognizedNetsuiteErpInvoicesDeprecated(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    const filterInvoicesReadyForRevenueRecognition = this.filterReadyForRevenueRecognition();

    const [filterArticlesByNotNullDatePublished] = this.articleRepo.filterBy({
      whereNotNull: 'articles.datePublished',
    });

    // search invoices through invoice items
    const maybeInvoiceItems = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(
      filterArticlesByNotNullDatePublished.manuscriptId
    );

    if (maybeInvoiceItems.isLeft()) {
      return left(maybeInvoiceItems.value);
    }

    const invoiceItems = maybeInvoiceItems.value;

    const invoiceQueries = invoiceItems.map((ii) =>
      this.getInvoiceById(ii.invoiceId)
    );

    const invoicesWithPublishedManuscripts = flatten(
      await Promise.all(invoiceQueries)
    );

    if (invoicesWithPublishedManuscripts.isLeft()) {
      return left(
        RepoError.fromDBError(
          new Error(invoicesWithPublishedManuscripts.value.message)
        )
      );
    }

    return right(
      filterInvoicesReadyForRevenueRecognition(
        invoicesWithPublishedManuscripts.value
      )
    );
  }

  public async getUnrecognizedSageErpInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    return right([]);
  }

  public async getUnregisteredErpCreditNotes(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    return right([]);
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

  private filterInvoiceById(invoiceId: InvoiceId): Invoice | null {
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

  async findByCancelledInvoiceReference(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const found = this._items.find(
      (item) => item.cancelledInvoiceReference === id.id.toString()
    );

    if (!found) {
      return left(
        new Error(
          `No invoice with cancelled invoice reference ${id.id.toString()}`
        )
      );
    }

    return right(found);
  }

  async isInvoiceDeleted(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this.deletedItems.find((invoice) => invoice.id.equals(id.id));

    return right(!!found);
  }

  async getInvoicePayments(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, any[]>> {
    return right([]);
  }

  async getUnrecognizedReversalsNetsuiteErp(): Promise<Either<GuardFailure | RepoError, any[]>> {
    return right([]);
  }

}
