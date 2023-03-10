// * Core Domain
import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';
import { Guard } from '../../../core/logic/Guard';

export interface ErpReferenceProps {
  readonly entity_id: string;
  readonly vendor: string;
  entity_type: string;
  attribute?: string;
  value?: string;
}
/**
 * @desc Read model for ErpReference
 */
export class ErpReference extends ValueObject<ErpReferenceProps> {
  get entity_id(): string {
    return this.props.entity_id;
  }

  get vendor(): string {
    return this.props.vendor;
  }

  get entityType(): string {
    return this.props.entity_type;
  }

  get attribute(): string {
    return this.props.attribute;
  }

  get value(): string {
    return this.props.value;
  }

  private constructor(props: ErpReferenceProps) {
    super(props);
  }

  public static create(
    props: ErpReferenceProps
  ): Either<GuardFailure, ErpReference> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.entity_id, argumentName: 'entity_id' },
      { argument: props.vendor, argumentName: 'vendor' },
      { argument: props.entity_type, argumentName: 'entity_type' },
    ]);

    if (!guardResult.succeeded) {
      return left(new GuardFailure(guardResult.message));
    }

    const newErpReference = new ErpReference({
      ...props,
      vendor: props.vendor ?? null,
      entity_type: props.entity_type ?? null,
    });

    return right(newErpReference);
  }
}
