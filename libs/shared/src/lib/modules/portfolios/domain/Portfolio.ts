// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';
// import {Guard} from '../../core/Guard';

// * Subdomain
import {PortfolioId} from './PortfolioId';

interface PortfolioProps {
  name: string;
}

export class Portfolio extends AggregateRoot<PortfolioProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get portfolioId(): PortfolioId {
    return PortfolioId.caller(this.id);
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: PortfolioProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: PortfolioProps,
    id?: UniqueEntityID
  ): Result<Portfolio> {
    // const guardResult = Guard.againstNullOrUndefinedBulk([
    //   {argument: props.email, argumentName: 'email'},
    //   {argument: props.password, argumentName: 'password'}
    // ]);
    // if (!guardResult.succeeded) {
    //   return Result.fail<User>(guardResult.message);
    // } else {
    const portfolio = new Portfolio(
      {
        ...props
      },
      id
    );
    // const idWasProvided = !!id;
    // if (!idWasProvided) {
    //   user.addDomainEvent(new UserCreatedEvent(user));
    // }
    return Result.ok<Portfolio>(portfolio);
  }
}
