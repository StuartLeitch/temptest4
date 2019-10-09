// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

// * Subdomain
import {RoleId} from './RoleId';
import {Roles} from './enums/Roles';

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

  public static create(props: RoleProps, id?: UniqueEntityID): Result<Role> {
    const role = new Role(
      {
        ...props
      },
      id
    );
    return Result.ok<Role>(role);
  }
}
