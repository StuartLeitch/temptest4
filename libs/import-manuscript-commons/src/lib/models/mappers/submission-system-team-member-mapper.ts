import {Mapper} from "@hindawi/shared";
import {TeamMember, TeamMemberProps} from "../submission-system-models/team-member";

export interface RawTeamMemberProps {
  id: string;
}

export class SubmissionSystemTeamMemberMapper extends Mapper<TeamMember> {
  static toDomain(raw: Partial<RawTeamMemberProps[]>): TeamMember {
    const props: TeamMemberProps = {
      id: raw.pop().id,
    };
    return TeamMember.create(props);
  }

  static toPersistance(
    draftSubmission: TeamMember
  ): RawTeamMemberProps {
    return {
      id: draftSubmission.id,
    };
  }
}
