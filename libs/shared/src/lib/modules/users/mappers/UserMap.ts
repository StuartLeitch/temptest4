import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {User} from '../domain/User';

export class UserMap extends Mapper<User> {
  public static toDomain(raw: any): User {
    const userOrError = User.create(
      {
        name: raw.name,
        role: raw.role,
        email: raw.email
        // status: raw.status,
        // dateCreated: new Date(raw.dateCreated),
        // dateUpdated: new Date(raw.dateUpdated)
      },
      new UniqueEntityID(raw.id)
    );

    // userOrError.isFailure ? console.log(transactionOrError) : '';
    return userOrError.isSuccess ? userOrError.getValue() : null;
  }

  public static toPersistence(user: User): any {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
      // status: transaction.status,
      // dateCreated: transaction.dateCreated,
      // dateUpdated: transaction.dateUpdated
    };
  }
}
