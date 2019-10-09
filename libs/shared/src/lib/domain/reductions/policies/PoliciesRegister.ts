export class PoliciesRegister {
  policies = new Map();

  registerPolicy(policy: any) {
    this.policies.set(policy.getType(), policy);
  }

  get(name: Symbol) {
    return this.policies.get(name);
  }

  applyPolicy(policy: Symbol, conditions: any[]) {
    return this.get(policy).getDiscount(...conditions);
  }
}
