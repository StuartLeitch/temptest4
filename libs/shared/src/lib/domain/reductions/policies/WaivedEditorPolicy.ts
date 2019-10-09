import {PolicyContract} from '../contracts/Policy';
import {WaivedEditorRule} from './WaivedEditorRule';

/**
 * * All submissions from any Editorial Board members to the same journal on which they are current EBM
 * * - automatic on MTS if email address matches that on their Editor account
 *
 * FOR EACH (authors[author].email)
 * FOR EACH (journals[this.journal].editors[editor].email)
 * IF (authors[author].email == editors[editor].email)
 * THEN {APC = 0}
 */
export class WaivedEditorPolicy implements PolicyContract<WaivedEditorRule> {
  WAIVED_EDITOR = Symbol.for('@WaivedEditorPolicy');

  /**
   * @Description
   *    Calculate the Discount based on the journal id and editorial board members.
   * @param invoice
   */
  public getDiscount(
    journalId: string,
    editorialBoardMembers: any[],
    author: string
  ): WaivedEditorRule {
    return new WaivedEditorRule(journalId, editorialBoardMembers, author);
  }

  public getType(): Symbol {
    return this.WAIVED_EDITOR;
  }
}
