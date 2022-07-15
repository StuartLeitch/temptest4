import { Manuscript } from '../../domain/Manuscript';

export interface UpdateTaEligibilityDTO {
  manuscript: Manuscript;
  isEligible: boolean;
}
