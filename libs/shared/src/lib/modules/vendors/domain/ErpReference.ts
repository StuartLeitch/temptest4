// * Core Domain
// import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { ValueObject } from '../../../core/domain/ValueObject';
// import { Result } from '../../../core/logic/Result';

// import { ValueObject } from '../../../shared/domain/ValueObject';
// import { Guard } from '../../../shared/core/Guard';
// import { UserName } from '../../users/domain/userName';
// // * Subdomain
// import { AddressId } from './AddressId';

export interface ErpReferenceProps {
  vendor: string;
  entity_type: string;
  attribute?: string;
  value?: string;
}
/**
 * @desc Read model for ErpReference
 */
export class ErpReference extends ValueObject<ErpReferenceProps> {
  get vendor(): string {
    return this.props.vendor;
  }

  // get reputation(): number {
  //   return this.props.reputation;
  // }

  // get isAdminUser(): boolean {
  //   return this.props.isAdminUser;
  // }

  // get isDeleted(): boolean {
  //   return this.props.isDeleted;
  // }

  // private constructor(props: ErpReferenceProps) {
  //   super(props);
  // }

  // public static create(props: ErpReferenceProps): Result<ErpReference> {
  //   const guardResult = Guard.againstNullOrUndefinedBulk([
  //     { argument: props.username, argumentName: 'username' },
  //     { argument: props.reputation, argumentName: 'reputation' },
  //   ]);

  //   if (!guardResult.succeeded) {
  //     return Result.fail<ErpReference>(guardResult.message);
  //   }

  //   return Result.ok<ErpReference>(
  //     new ErpReference({
  //       ...props,
  //       isAdminUser: props.isAdminUser ? props.isAdminUser : false,
  //       isDeleted: props.isDeleted ? props.isDeleted : false,
  //     })
  //   );
  // }
}
