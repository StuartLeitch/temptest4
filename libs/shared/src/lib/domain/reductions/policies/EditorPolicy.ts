import {PolicyContract} from '../contracts/Policy';
import {EditorRule} from './EditorRule';

/**
 * * All submissions from any Editorial Board members to the same journal on which they are current EBM
 * * - automatic on MTS if email address matches that on their Editor account
 *
 * FOR EACH (authors[author].email)
 * FOR EACH (journals[this.journal].editors[editor].email)
 * IF (authors[author].email == editors[editor].email)
 * THEN {APC = 0}
 */
export class EditorPolicy implements PolicyContract<EditorRule> {
  EDITOR = Symbol.for('@EditorPolicy');

  /**
   * @Description
   *    Calculate the Discount based on the journal id and editorial board members.
   * @param invoice
   */
  public getDiscount(
    journalId: string,
    editorialBoardMembers: any[],
    author: string
  ): EditorRule {
    return new EditorRule(journalId, editorialBoardMembers, author);
  }

  public getType(): symbol {
    return this.EDITOR;
  }
}
