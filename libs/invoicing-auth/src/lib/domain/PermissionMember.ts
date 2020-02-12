import { EncodedMember } from './EncodedMember';
import { Permission } from './Permission';

export class PermissionMember extends EncodedMember {
  constructor(private permission: Permission) {
    super(permission.name, EncodedMember.PermissionType);
  }
}
