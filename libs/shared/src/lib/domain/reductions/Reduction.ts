// * Core Domain
import {AggregateRoot} from '../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';
import {ReductionId} from './ReductionId';

export interface ReductionProps {
  reductionId?: ReductionId;
  name: string;
  reduction: number;
  readonly type?: string;
  isAutomatic?: boolean;
  isValid?: boolean;
  created?: Date;
}

export abstract class Reduction extends AggregateRoot<ReductionProps> {
  protected readonly reductionPercentage: number = 0;

  public get id(): UniqueEntityID {
    return this._id;
  }

  get reductionId(): ReductionId {
    return ReductionId.create(this.id);
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
