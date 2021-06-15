import { Either, right } from '../../core/logic/Either';
import { UseCase } from './UseCase';

type EitherNull = Either<null, null>;

export class NoOpUseCase implements UseCase<null, EitherNull, null> {
  public async execute(request?: Record<string, unknown>): Promise<EitherNull> {
    return right(null);
  }
}
