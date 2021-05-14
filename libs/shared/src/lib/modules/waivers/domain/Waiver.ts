// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import {
  Reduction,
  ReductionProps,
  ReductionType,
} from '../../../domain/reductions/Reduction';

export type WaiverCollection = Waiver[];

export enum WaiverType {
  WAIVED_CHIEF_EDITOR = 'WAIVED_CHIEF_EDITOR',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY',
  WAIVED_COUNTRY_50 = 'WAIVED_COUNTRY_50',
  WAIVED_MIGRATION = 'WAIVED_MIGRATION',
  EDITOR_DISCOUNT = 'EDITOR_DISCOUNT',
  WAIVED_COUNTRY = 'WAIVED_COUNTRY',
  WAIVED_EDITOR = 'WAIVED_EDITOR',
}

export interface WaiverProps extends ReductionProps {
  waiverType: WaiverType;
  isActive?: boolean;
}

export class Waiver extends Reduction<WaiverProps> {
  public get reduction(): number {
    return this.props.reduction;
  }

  get id(): UniqueEntityID {
    return this._id;
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
