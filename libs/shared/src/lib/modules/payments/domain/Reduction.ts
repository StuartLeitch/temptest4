import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

type REDUCTION_REASONS = 'Editor' | 'System';

interface ReductionProps {
  name: string;
  percentage: number;
  reason: REDUCTION_REASONS;
}

export class Reduction extends AggregateRoot<ReductionProps> {
  get name(): string {
    return this.props.name;
  }

  get percentage(): number {
    return this.props.percentage;
  }

  public constructor(props: ReductionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Reduction> {
    // const propsResult = Guard.againstNullOrUndefinedBulk([
    //   {argument: props.album, argumentName: 'album'},
    //   {argument: props.artist, argumentName: 'artist'},
    //   {argument: props.traderId, argumentName: 'traderId'}
    // ]);
    // if (!propsResult.succeeded) {
    //   return Result.fail<Vinyl>(propsResult.message);
    // }
    const reduction = new Reduction(
      {
        ...props
      },
      id
    );
    // const isNewlyCreated = !!id === false;
    // if (isNewlyCreated) {
    //   vinyl.addDomainEvent(new VinylCreatedEvent(vinyl.vinylId));
    // }
    return Result.ok<Reduction>(reduction);
  }
}
