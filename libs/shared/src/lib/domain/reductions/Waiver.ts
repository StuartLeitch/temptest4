// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {ReductionProps} from './Reduction';
import {Discount} from './Discount';
import {WaiverId} from './WaiverId';
import {InvoiceId} from './../../modules/invoices/domain/InvoiceId';

export type WaiverCollection = Waiver[];

export class Waiver extends Discount {
  readonly reductionPercentage: number = 1;

  get waiverId(): WaiverId {
    return WaiverId.create(this._id).getValue();
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  set invoiceId(invoiceId: InvoiceId) {
    this.props.invoiceId = invoiceId;
  }

  get percentage(): number {
    return this.props.reduction || this.reductionPercentage;
  }

  public static create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Waiver> {
    return Result.ok<Waiver>(
      new Waiver(
        {
          ...props,
          type: props.type ? props.type : 'WAIVER'
        },
        id
      )
    );
  }
}
