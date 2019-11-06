import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {JournalRepoContract} from '../journalRepo';
import {Journal} from '../../domain/Journal';
import {JournalId} from '../../domain/JournalId';

export class MockJournalRepo extends BaseMockRepo<Journal>
  implements JournalRepoContract {
  constructor() {
    super();
  }

  public async getJournalById(journalId: JournalId): Promise<Journal> {
    const match = this._items.find(i => i.journalId.equals(journalId));
    return match ? match : null;
  }

  public async getJournalCollection(): Promise<Journal[]> {
    return this._items;
  }

  public async exists(journal: Journal): Promise<boolean> {
    const found = this._items.filter(i => this.compareMockItems(i, journal));
    return found.length !== 0;
  }

  public async save(journal: Journal): Promise<Journal> {
    const alreadyExists = await this.exists(journal);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, journal)) {
          return journal;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(journal);
    }

    return journal;
  }

  public compareMockItems(a: Journal, b: Journal): boolean {
    return a.id.equals(b.id);
  }
}
