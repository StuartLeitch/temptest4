import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { ExchangeRate } from '../../domain/ExchangeRate';

import { ExchangeRateMap } from '../../mappers/ExchangeRateMap';
import { ExchangeRateRepoContract } from '../exchangeRateRepo';

export class KnexExchangeRepo
  extends AbstractBaseDBRepo<Knex, ExchangeRate>
  implements ExchangeRateRepoContract
{
  constructor(protected db: Knex) {
    super(db);
  }

  async exists(
    exchangeRate: ExchangeRate
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      const result = await this.db(TABLES.USD_GBP_EXCHANGE_RATE)
        .where('exchangeDate', exchangeRate.date)
        .countDistinct({ exchangeRateCount: 'exchangeDate' })
        .first();

      return right(result.exchangeRateCount !== 0);
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  async exchangeRateExistsForDate(date: Date): Promise<boolean> {
    try {
      const result = await this.db(TABLES.USD_GBP_EXCHANGE_RATE)
        .where('exchangeDate', date)
        .countDistinct({ exchangeRateCount: 'exchangeDate' })
        .first();

      return Number.parseInt(result.exchangeRateCount, 10) !== 0;
    } catch (err) {
      throw RepoError.fromDBError(err);
    }
  }

  async getClosestExchangeRate(date: Date): Promise<ExchangeRate> {
    const higher = await this.db(TABLES.USD_GBP_EXCHANGE_RATE)
      .select()
      .where('exchangeDate', '>=', date)
      .orderBy('exchangeDate', 'asc')
      .first();
    const lower = await this.db(TABLES.USD_GBP_EXCHANGE_RATE)
      .select()
      .where('exchangeDate', '<=', date)
      .orderBy('exchangeDate', 'desc')
      .first();

    if (!higher && !lower) {
      throw new RepoError(
        RepoErrorCode.ENTITY_NOT_FOUND,
        'There is no exchange rate saved'
      );
    }

    if (!higher) {
      return ExchangeRateMap.toDomain(lower);
    }

    if (!lower) {
      return ExchangeRateMap.toDomain(higher);
    }

    const lowDif = date.getTime() - lower.exchangeDate.getTime();
    const highDif = higher.exchangeDate.getTime() - date.getTime();

    if (lowDif < highDif) {
      return ExchangeRateMap.toDomain(lower);
    } else {
      return ExchangeRateMap.toDomain(higher);
    }
  }

  async getExchangeRate(date: Date): Promise<ExchangeRate> {
    const result = await this.db(TABLES.USD_GBP_EXCHANGE_RATE)
      .select()
      .where('exchangeDate', date)
      .first();

    if (!result) {
      throw RepoError.createEntityNotFoundError(
        'exchange rate',
        date.toISOString()
      );
    }

    return ExchangeRateMap.toDomain(result);
  }

  async save(
    rate: ExchangeRate
  ): Promise<Either<GuardFailure | RepoError, ExchangeRate>> {
    const { exchangeDate, exchangeRate } = ExchangeRateMap.toPersistance(rate);

    try {
      await this.db(TABLES.USD_GBP_EXCHANGE_RATE).insert({
        exchangeDate,
        exchangeRate,
      });
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    const dbData = await this.getExchangeRate(exchangeDate);

    return right(dbData);
  }
}
