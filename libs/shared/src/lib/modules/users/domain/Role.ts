// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

// * Subdomain
import { RoleId } from './RoleId';
import { Roles } from './enums/Roles';

interface RoleProps {
  name: Roles;
}

export class Role extends AggregateRoot<RoleProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get roleId(): RoleId {
    return RoleId.caller(this.id);
  }

  get name(): Roles {
    return this.props.name;
  }

  private constructor(props: RoleProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: RoleProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Role> {
    const role = new Role(
      {
        ...props,
      },
      id
    );
    return right(role);
  }
}
