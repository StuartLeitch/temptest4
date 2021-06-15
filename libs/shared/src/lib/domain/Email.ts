import { Either, right, left } from '../core/logic/Either';
import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';
import { Guard } from '../core/logic/Guard';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value.trim();
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(props: EmailProps): Either<GuardFailure, Email> {
    const guardResult = Guard.againstInvalidEmail(props.value);

    if (!guardResult.succeeded) {
      return left(new GuardFailure(guardResult.message));
    }

    return right(new Email(props));
  }

  toString(): string {
    return this.props.value.trim();
  }
}
