export abstract class EncodedMember {
  public static GroupType = 'G';
  public static PermissionType = 'P';
  public static RoleType = 'R';
  public static UserType = 'U';

  constructor(private id: string, private type: string) {}

  public isGroup(): boolean {
    return this.type === EncodedMember.GroupType;
  }

  public isPermission(): boolean {
    return this.type === EncodedMember.PermissionType;
  }

  public isRole(): boolean {
    return this.type === EncodedMember.RoleType;
  }

  public isUser(): boolean {
    return this.type === EncodedMember.UserType;
  }

  public isSameAs(type: string): boolean {
    return this.type === type;
  }

  // @Override
  // public boolean equals(final Object other) {
  //   if (other == null || other.getClass() != this.getClass()) {
  //     return false;
  //   }

  //   final EncodedMember otherMember = (EncodedMember) other;

  //   return this.type == otherMember.type && this.id.equals(otherMember.id);
  // }

  // @Override
  // public int hashCode() {
  //   return 31 * (type + id.hashCode());
  // }

  public toString(): string {
    return `EncodedMember[type=${this.type} id=${this.id}]`;
  }
}
