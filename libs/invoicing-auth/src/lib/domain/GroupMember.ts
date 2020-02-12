import { EncodedMember } from './EncodedMember';
import { Group } from './Group';

export class GroupMember extends EncodedMember {
  constructor(private group: Group) {
    super(group.name, EncodedMember.GroupType);
  }
}
