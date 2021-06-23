import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';
import { Either, right } from '../core/logic/Either';

interface ClientTokenProps {
  token: string;
}

export class PaymentClientToken extends ValueObject<ClientTokenProps> {
  public static create(
    rawToken?: string
  ): Either<GuardFailure, PaymentClientToken> {
    if (rawToken) {
      const props: ClientTokenProps = { token: rawToken };

      return right(
        new PaymentClientToken({
          ...props,
        })
      );
    }
  }

  get value(): ClientTokenProps {
    return this.props;
  }

  get token(): string {
    return this.props.token;
  }

  public toJSON(): string {
    return JSON.stringify({
      token: this.token,
    });
  }

  private constructor(props: ClientTokenProps) {
    super(props);
  }
}
