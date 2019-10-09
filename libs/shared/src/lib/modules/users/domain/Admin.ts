// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

import {Roles} from './enums/Roles';
import {UserProps} from './User';

export class Admin extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<Admin> {
    const admin = new Admin(
      {
        ...props,
        role: Roles.ADMIN,
        dateAdded: props.dateAdded ? props.dateAdded : new Date()
      },
      id
    );
    return Result.ok<Admin>(admin);
  }
}
