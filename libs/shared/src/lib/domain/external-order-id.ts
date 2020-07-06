import { ValueObject } from '../core/domain/ValueObject';

interface ExternalOrderIdProps {
  id: string;
}

export class ExternalOrderId extends ValueObject<ExternalOrderIdProps> {
  public static create(rawId: string): ExternalOrderId | null {
    if (!rawId) return null;

    const props: ExternalOrderIdProps = { id: rawId };
    return new ExternalOrderId({
      ...props,
    });
  }

  get value(): ExternalOrderIdProps {
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

  private constructor(props: ExternalOrderIdProps) {
    super(props);
  }
}
