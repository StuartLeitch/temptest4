import { ErpReference } from '../../vendors/domain/ErpReference';
import { WatchedList } from '../../../core/domain/WatchedList';

export class InvoiceErpReferences extends WatchedList<ErpReference> {
  private constructor(initialErpReferences: ErpReference[]) {
    super(initialErpReferences);
  }

  public static create(
    initialErpReferences?: ErpReference[]
  ): InvoiceErpReferences {
    return new InvoiceErpReferences(
      initialErpReferences ? initialErpReferences : []
    );
  }

  public compareItems(a: ErpReference, b: ErpReference): boolean {
    return a.equals(b);
  }
}
