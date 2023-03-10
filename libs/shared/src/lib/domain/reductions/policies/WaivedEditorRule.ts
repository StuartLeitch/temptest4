import { ReductionRuleContract } from '../contracts/ReductionRule';
import { Waiver, WaiverType } from '../../../modules/waivers/domain/Waiver';

export class WaivedEditorRule implements ReductionRuleContract<Waiver> {
  public constructor(
    private journalId: string,
    private editorialBoardMembers: any[],
    private author: string
  ) {}

  public getReduction(): Waiver {
    const waiver = Waiver.create({
      reduction: 100,
      waiverType: WaiverType.WAIVED_CHIEF_EDITOR,
    });

    if (waiver.isLeft()) {
      throw waiver.value;
    }

    return waiver.value;
  }
}
