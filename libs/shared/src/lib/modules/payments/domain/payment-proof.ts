import { ValueObject } from '../../../core/domain/ValueObject';

interface PaymentProofProps {
  id: string;
}

export class PaymentProof extends ValueObject<PaymentProofProps> {
  public static create(rawId: string): PaymentProof | null {
    if (!rawId) return null;

    const props: PaymentProofProps = { id: rawId };
    return new PaymentProof({
      ...props,
    });
  }

  get value(): PaymentProofProps {
    return this.props;
  }

  get id(): string {
    return this.props.id;
  }

  public toJSON(): string {
    return JSON.stringify({
      token: this.id,
    });
  }

  public toString(): string {
    return this.id;
  }

  private constructor(props: PaymentProofProps) {
    super(props);
  }
}
