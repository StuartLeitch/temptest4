/* eslint-disable @typescript-eslint/no-unused-vars */
import { Either } from '../../core/logic/Result';
import { right } from '../../core/logic/Result';
import { UseCase } from './UseCase';

type EitherNull = Either<null, null>;

export class NoOpUseCase implements UseCase<null, EitherNull, null> {
  public async execute(request?: Record<string, unknown>): Promise<EitherNull> {
    return right(null);
  }
}
