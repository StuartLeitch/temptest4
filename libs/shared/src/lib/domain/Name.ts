import { Either, right, left } from '../core/logic/Either';
import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';
import { Guard } from '../core/logic/Guard';

interface NameProps {
  value: string;
}

export class Name extends ValueObject<NameProps> {
  get value(): string {
    return this.props.value.trim();
  }

  private constructor(props: NameProps) {
    super(props);
  }

  public static create(props: NameProps): Either<GuardFailure, Name> {
    const nullGuardResult = Guard.againstNullOrUndefined(props.value, 'name');

    if (!nullGuardResult.succeeded) {
      return left(new GuardFailure(nullGuardResult.message));
    }

    return right(new Name(props));
  }

  toString(): string {
    return this.props.value.trim();
  }
}
