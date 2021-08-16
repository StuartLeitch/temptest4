import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';
import { Entity } from '../../../core/domain/Entity';

export interface AuditLogProps {
  userAccount: string;
  entity: string;
  action: string;
  timestamp: Date;
  old_value: string;
  current_value: string;
}

export class AuditLog extends Entity<AuditLogProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get userAccount(): string {
    return this.props.userAccount;
  }

  get entity(): string {
    return this.props.entity;
  }

  get action(): string {
    return this.props.userAccount;
  }

  get timestamp(): Date {
    return new Date(this.props.timestamp);
  }

  get oldValue(): string {
    return this.props.old_value;
  }

  get currentValue(): string {
    return this.props.current_value;
  }

  private constructor(props: AuditLogProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: AuditLogProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, AuditLog> {
    return right(
      new AuditLog(
        {
          ...props
        },
        id
      )
    );
  }
}
