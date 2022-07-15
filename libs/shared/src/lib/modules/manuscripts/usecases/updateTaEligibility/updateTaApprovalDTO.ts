import { Manuscript } from '../../domain/Manuscript';

export interface UpdateTaApprovalDTO {
  manuscript: Manuscript;
  isApproved: boolean;
}
