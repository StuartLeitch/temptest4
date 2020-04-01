import uuid from 'uuid/v4';
import { Identifier } from './Identifier';

export class CorrelationID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id ? id : uuid());
  }
}
