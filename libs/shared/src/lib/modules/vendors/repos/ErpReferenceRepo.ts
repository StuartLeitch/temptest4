import { Repo } from '../../../infrastructure/Repo';
import { ErpReference } from '../domain/ErpReference';
import { InvoiceErpReferences } from './../../invoices/domain/InvoiceErpReferences';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export interface ErpReferenceRepoContract extends Repo<ErpReference> {
  getErpReferencesByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<InvoiceErpReferences>;
  save(erpReference: ErpReference): Promise<ErpReference>;
}
