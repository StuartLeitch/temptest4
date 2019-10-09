import {ReductionRuleContract} from '../contracts/ReductionRule';

export class EditorRule implements ReductionRuleContract {
  public constructor(
    private journalId: string,
    private editorialBoardMembers: any[],
    private author: string
  ) {}

  public getReduction(): number {
    return 50;
  }
}
