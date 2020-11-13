import { Result } from '../../../core/logic/Result';

export class InvalidErpReference extends Result<string> {
  constructor() {
    super(false, 'Invalid ERP Reference.');
  }
}
