import { ValueObject } from '../core/domain/ValueObject';
import { Result } from '../core/logic/Result';

interface ClientTokenProps {
  token: string;
}

export class PaymentClientToken extends ValueObject<ClientTokenProps> {
  public static create(rawToken?: string): Result<PaymentClientToken> {
    if (rawToken) {
      const props: ClientTokenProps = { token: rawToken };

      return Result.ok<PaymentClientToken>(
        new PaymentClientToken({
          ...props
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
      token: this.token
    });
  }

  private constructor(props: ClientTokenProps) {
    super(props);
  }
}
