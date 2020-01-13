// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import {
  Reduction,
  ReductionProps,
  ReductionType
} from '../../../domain/reductions/Reduction';

export type WaiverCollection = Waiver[];

export enum WaiverType {
  WAIVED_COUNTRY = 'WAIVED_COUNTRY',
  WAIVED_CHIEF_EDITOR = 'WAIVED_CHIEF_EDITOR',
  EDITOR_DISCOUNT = 'EDITOR_DISCOUNT',
  WAIVED_EDITOR = 'WAIVED_EDITOR',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY'
}

export interface WaiverProps extends ReductionProps {
  waiverType: WaiverType;
  isActive?: boolean;
}

export class Waiver extends Reduction<WaiverProps> {
  public get reduction(): number {
    return this.props.reduction;
  }

  get waiverType(): WaiverType {
    return this.props.waiverType;
  }

  get percentage(): number {
    return this.props.reduction || this.reductionPercentage;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  public get reductionType(): ReductionType {
    return ReductionType.WAIVER;
  }

  public static create(
    props: WaiverProps,
    id?: UniqueEntityID
  ): Result<Waiver> {
    return Result.ok<Waiver>(new Waiver(props, id));
  }
}
