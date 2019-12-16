// * Core Domain
import { Result } from '../../core/logic/Result';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { ReductionProps, Reduction, ReductionType } from './Reduction';
import { WaiverId } from './WaiverId';
import { InvoiceId } from './../../modules/invoices/domain/InvoiceId';

export type WaiverCollection = Waiver[];

export enum WaiverType {
  WAIVED_COUNTRY = 'WAIVED_COUNTRY',
  WAIVED_CE = 'WAIVED_CE',
  WAIVED_EDITOR_EB = 'WAIVED_EDITOR_EB',
  WAIVED_EDITOR = 'WAIVED_EDITOR',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY'
}

export interface WaiverProps extends ReductionProps {
  waiverType: WaiverType;
  invoiceId?: InvoiceId;
}

export class Waiver extends Reduction<WaiverProps> {
  public get reduction(): number {
    return this.props.reduction;
  }
  readonly reductionPercentage: number = 1;

  get waiverId(): WaiverId {
    return WaiverId.create(this._id).getValue();
  }

  get waiverType(): WaiverType {
    return this.props.waiverType
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  set invoiceId(id: InvoiceId) {
    this.props.invoiceId = id;
  }

  get percentage(): number {
    return this.props.reduction || this.reductionPercentage;
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
