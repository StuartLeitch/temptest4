import { Apc } from './Apc';

export interface ApcPaginated {
  auditLogs: Array<Apc>;
  totalCount: string;
}
