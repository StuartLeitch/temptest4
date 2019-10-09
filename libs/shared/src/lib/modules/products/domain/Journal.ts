// * Core Domain
import {Result} from '../../../core/logic/Result';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Product, ProductProps} from './Product';

export class Journal extends Product {
  public create(props: ProductProps, id?: UniqueEntityID): Result<Journal> {
    const journal = new Journal(
      {
        ...props
      },
      id
    );
    return Result.ok<Journal>(journal);
  }
}

// export class Journal extends Product {
//   // private articleId: ArticleId;
//   // private numberOfPages: number;

//   // private constructor(props: ProductProps, id?: UniqueEntityID) {
//   //   super(props, id);
//   // }

//   public static create(props: ProductProps, id?: UniqueEntityID): Result<any> {
//     // const guardResult = Guard.againstNullOrUndefinedBulk([
//     //   {argument: props.email, argumentName: 'email'},
//     //   {argument: props.password, argumentName: 'password'}
//     // ]);
//     // if (!guardResult.succeeded) {
//     //   return Result.fail<User>(guardResult.message);
//     // } else {
//     const journal = new Journal(
//       {
//         ...props
//       },
//       id
//     );
//     // const idWasProvided = !!id;
//     // if (!idWasProvided) {
//     //   user.addDomainEvent(new UserCreatedEvent(user));
//     // }
//     return Result.ok<Journal>(journal);
//   }
// }
