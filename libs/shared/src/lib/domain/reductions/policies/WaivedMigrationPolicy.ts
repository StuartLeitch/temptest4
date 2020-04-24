import { PolicyContract } from '../contracts/Policy';

import { WaivedMigrationRule } from './WaivedMigrationRule';

export class WaivedMigrationPolicy
  implements PolicyContract<WaivedMigrationRule> {
  WAIVED_MIGRATION = Symbol.for('@WaivedMigrationPolicy');

  getDiscount(mtsStatus: string): WaivedMigrationRule {
    return new WaivedMigrationRule(mtsStatus);
  }

  getType(): symbol {
    return this.WAIVED_MIGRATION;
  }
}
