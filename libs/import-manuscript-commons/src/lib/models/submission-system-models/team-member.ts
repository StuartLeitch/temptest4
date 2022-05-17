import { ValueObject, ValueObjectProps } from '@hindawi/shared';

export interface TeamMemberProps extends ValueObjectProps {
  id: string;
}

export class TeamMember extends ValueObject<TeamMemberProps> {
  get id(): string {
    return this.props.id;
  }

  private constructor(props: TeamMemberProps) {
    super(props);
  }

  static create(props: TeamMemberProps): TeamMember {
    return new TeamMember(props);
  }
}
