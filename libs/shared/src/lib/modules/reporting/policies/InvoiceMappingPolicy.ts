import { EventMappingPolicyContract } from '../contracts/EventMappingPolicy';
import { REPORTING_TABLES } from '../constants';

export class InvoiceMappingPolicy implements EventMappingPolicyContract {
  getTable(): REPORTING_TABLES {
    return REPORTING_TABLES.INVOICE;
  }
  includesEvent(eventName: string): boolean {
    return eventName.startsWith('Invoice');
  }
}
