import {BaseJsonRepo} from '../../../../infrastructure/BaseJsonRepo';
import {PriceRepoContract} from '../priceRepo';
import {Price} from '../../domain/Price';
import {PriceId} from '../../domain/PriceId';
import {PriceMap} from '../../mappers/PriceMap';

export class PriceJsonRepo extends BaseJsonRepo<Price>
  implements PriceRepoContract {
  private db;

  constructor(db: any) {
    super();
    this.db = db;
  }

  public async findById(priceId: PriceId): Promise<Price> {
    const rawPrice = await this.db
      .get('prices')
      .find({id: priceId.id.toString()})
      .value();

    return rawPrice ? PriceMap.toDomain(rawPrice) : null;
  }

  public async getPriceId(priceId: PriceId): Promise<unknown> {
    // const matches = this._items.filter(i =>
    //   i.transactionId.equals(transactionId)
    // );
    // if (matches.length !== 0) {
    //   return matches[0];
    // } else {
    return null;
    // }
  }

  public async getPriceCollection(): Promise<Price[]> {
    return this.db.get('prices').value();
  }

  public async save(price: Price): Promise<Price> {
    // const rawPrice = PriceMap.toPersistence(price);
    // this.db
    //   .get('prices')
    //   .push(rawPrice)
    //   .write();
    return price;
  }

  public async exists(): Promise<boolean> {
    return true;
  }

  public compareJsonItems(): boolean {
    return true;
  }
}
