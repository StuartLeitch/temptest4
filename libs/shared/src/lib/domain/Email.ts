import { ValueObject } from '../core/domain/ValueObject';
import { Result } from '../core/logic/Result';
import { Guard } from '../core/logic/Guard';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(props: EmailProps): Result<Email> {
    const guardResult = Guard.againstInvalidEmail(props.value);

    if (!guardResult.succeeded) {
      return Result.fail<Email>(guardResult.message);
    }

    return Result.ok<Email>(new Email(props));
  }
}
