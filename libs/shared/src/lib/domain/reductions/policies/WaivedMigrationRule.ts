import { ReductionRuleContract } from '../contracts/ReductionRule';
import { WaiverType, Waiver } from '../../../modules/waivers/domain/Waiver';

const WaivedMtsStatus = {
  InvitedContribution: 'InvitedContribution',
  GEWaivedManuscript: 'GEWaivedManuscript',
  FreeSubjectarea: 'FreeSubjectarea',
  WaivedCountry: 'WaivedCountry',
  GrantWaiver: 'GrantWaiver',
  FreePeriod: 'FreePeriod',
  WaivedOnce: 'WaivedOnce',
  FreeTypes: 'FreeTypes',
  NoPolicy: 'NoPolicy',
  Waived: 'Waived',
};

export class WaivedMigrationRule implements ReductionRuleContract<Waiver> {
  constructor(private mtsStatus: string) {}

  getReduction(): Waiver {
    if (this.mtsStatus in WaivedMtsStatus) {
      const waiver = Waiver.create({
        reduction: 100,
        waiverType: WaiverType.WAIVED_MIGRATION,
      });

      if (waiver.isLeft()) {
        throw waiver.value;
      }

      return waiver.value;
    }
  }
}
