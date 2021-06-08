import { cloneDeep } from 'lodash';
import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { CreditNoteRepoContract } from './../creditNoteRepo';
import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteId } from '../../domain/CreditNoteId';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';

export class MockCreditNoteRepo
  extends BaseMockRepo<CreditNote>
  implements CreditNoteRepoContract {
  public async getCreditNoteByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<CreditNote> {
    const match = this._items.find((i) => i.invoiceId.equals(invoiceId));
    return match;
  }

  public async getCreditNoteById(
    creditNoteId: CreditNoteId
  ): Promise<CreditNote> {
    const match = this._items.find((i) => i.creditNoteId.equals(creditNoteId));
    return match;
  }

  public async update(creditNote: CreditNote): Promise<CreditNote> {
    const alreadyExists = await this.exists(creditNote);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, creditNote)) {
          return creditNote;
        } else {
          return i;
        }
      });
    }

    return cloneDeep(creditNote);
  }

  public async save(creditNote: CreditNote): Promise<CreditNote> {
    const alreadyExists = await this.exists(creditNote);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, creditNote)) {
          return creditNote;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(creditNote);
    }

    return cloneDeep(creditNote);
  }

  public async exists(creditNote: CreditNote): Promise<boolean> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, creditNote)
    );
    return found.length !== 0;
  }

  public compareMockItems(a: CreditNote, b: CreditNote): boolean {
    return a.id.equals(b.id);
  }
}
