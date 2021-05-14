import { ReductionRuleContract } from '../contracts/ReductionRule';
import { PolicyContract } from '../contracts/Policy';

import { Waiver } from '../../../modules/waivers/domain/Waiver';

export class PoliciesRegister {
  policies = new Map<symbol, PolicyContract<ReductionRuleContract<Waiver>>>();

  registerPolicy(policy: any) {
    this.policies.set(policy.getType(), policy);
  }

  get(name: symbol) {
    return this.policies.get(name);
  }

  applyPolicy(policy: symbol, conditions: any[]) {
    return this.get(policy).getDiscount(...conditions);
  }
}
