import {PermissionContract} from './Permission';

export interface ResourceContract {
  name: string;
  readonly identify: string;
  permissions: PermissionContract[];
}
