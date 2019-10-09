// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';
// import {Guard} from '../../core/Guard';

// * Subdomain
import {PortfolioId} from '../../portfolios/domain/PortfolioId';
import {TeamId} from './TeamId';

interface TeamProps {
  name: string;
  portfolioId: PortfolioId;
}

export class Team extends AggregateRoot<TeamProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get teamId(): TeamId {
    return TeamId.caller(this.id);
  }

  get portfolioId(): PortfolioId {
    return this.props.portfolioId;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: TeamProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: TeamProps, id?: UniqueEntityID): Result<Team> {
    // const guardResult = Guard.againstNullOrUndefinedBulk([
    //   {argument: props.email, argumentName: 'email'},
    //   {argument: props.password, argumentName: 'password'}
    // ]);
    // if (!guardResult.succeeded) {
    //   return Result.fail<User>(guardResult.message);
    // } else {
    const team = new Team(
      {
        ...props
      },
      id
    );
    // const idWasProvided = !!id;
    // if (!idWasProvided) {
    //   user.addDomainEvent(new UserCreatedEvent(user));
    // }
    return Result.ok<Team>(team);
  }
}
