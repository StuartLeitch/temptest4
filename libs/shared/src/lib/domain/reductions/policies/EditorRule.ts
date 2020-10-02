import { ReductionRuleContract } from '../contracts/ReductionRule';
import { Waiver, WaiverType } from '../../../modules/waivers/domain/Waiver';

export class EditorRule implements ReductionRuleContract<Waiver> {
  public constructor(
    private journalId: string,
    private editorialBoardMembers: any[],
    private author: string
  ) {}

  public getReduction(): Waiver {
    return Waiver.create({
      reduction: 50,
      waiverType: WaiverType.EDITOR_DISCOUNT,
    }).getValue();
  }
}
