export class PoliciesRegister {
  policies = new Map();

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
