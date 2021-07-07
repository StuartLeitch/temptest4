import { WatchedList } from '../../../core/domain/WatchedList';
import { CreditNote } from './CreditNote';

export class CreditNoteCollection extends WatchedList<CreditNote> {
  private constructor(initialCreditNotes: CreditNote[]) {
    super(initialCreditNotes);
  }

  public static create(creditNotes?: CreditNote[]): CreditNoteCollection {
    return new CreditNoteCollection(creditNotes ? creditNotes : []);
  }

  public compareItems(a: CreditNote, b: CreditNote): boolean {
    return a.equals(b);
  }
}
