// * Core Domain
import {AggregateRoot} from '../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

export interface ReductionProps {
  readonly type?: string;
  isAutomatic?: boolean;
  isValid?: boolean;
}

export abstract class Reduction extends AggregateRoot<ReductionProps> {
  protected readonly reductionPercentage: number = 0;

  public get id(): UniqueEntityID {
    return this._id;
  }

  public get type(): string {
    return this.props.type;
  }

  public get isAutomatic(): boolean {
    return this.props.isAutomatic;
  }

  public get isValid(): boolean {
    return this.props.isValid;
  }
}
