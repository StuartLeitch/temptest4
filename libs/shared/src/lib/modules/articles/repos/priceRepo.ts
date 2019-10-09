import {Repo} from '../../../infrastructure/Repo';
import {Price} from '../domain/Price';
import {PriceId} from '../domain/PriceId';

export interface PriceRepoContract extends Repo<Price> {
  findById(priceId: PriceId): Promise<Price>;
  // getPriceId(priceId: PriceId): Promise<unknown>;
}
