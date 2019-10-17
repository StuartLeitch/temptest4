import {PoliciesRegister as ReductionsPoliciesRegister} from '../../../../domain/reductions/policies/PoliciesRegister';
import {WaivedCountryPolicy} from '../../../../domain/reductions/policies/WaivedCountryPolicy';

export class WaiverService {
  public applyWaivers({country}: {price?: number; country: string}): any {
    const reductionsPoliciesRegister = new ReductionsPoliciesRegister();
    const waivedCountryPolicy: WaivedCountryPolicy = new WaivedCountryPolicy();
    reductionsPoliciesRegister.registerPolicy(waivedCountryPolicy);

    const reductions = reductionsPoliciesRegister.applyPolicy(
      waivedCountryPolicy.getType(),
      [country]
    );

    return reductions.getReduction();
  }
}
