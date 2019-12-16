// * Core Domain
import {AggregateRoot} from '../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

export enum ReductionType {
  WAIVER = 'WAIVER',
  COUPON = 'COUPON'
}
export interface ReductionProps {
  reduction: number;
}

export abstract class Reduction<T> extends AggregateRoot<ReductionProps&T> {
  protected readonly reductionPercentage: number = 0;

  public get id(): UniqueEntityID {
    return this._id;
  }

  public abstract get reduction(): number;

  public abstract get reductionType(): ReductionType;
}
