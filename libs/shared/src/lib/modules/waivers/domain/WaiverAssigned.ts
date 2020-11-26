import { ValueObject } from '../../../core/domain/ValueObject';

import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { Waiver } from './Waiver';

export interface WaiverAssignedProps {
  invoiceItemId: InvoiceItemId;
  dateAssigned: Date;
  waiver: Waiver;
}

export class WaiverAssigned extends ValueObject<WaiverAssignedProps> {
  get invoiceItemId(): InvoiceItemId {
    return this.props.invoiceItemId;
  }

  get dateAssigned(): Date {
    return this.props.dateAssigned;
  }

  get waiver(): Waiver {
    return this.props.waiver;
  }

  private constructor(props: WaiverAssignedProps) {
    super(props);
  }

  static create(props: WaiverAssignedProps): WaiverAssigned {
    const defaultValues = {
      ...props,
      appliedDate: props.dateAssigned ?? new Date(),
    };
    return new WaiverAssigned(defaultValues);
  }

  equals(wa: WaiverAssigned): boolean {
    const itemEq = this.invoiceItemId.equals(wa.invoiceItemId);
    const waiverEq = this.waiver.id.equals(wa.waiver.id);

    return itemEq && waiverEq;
  }
}
