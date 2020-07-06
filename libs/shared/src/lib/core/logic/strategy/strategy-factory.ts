import { Behavior } from './behavior';
import { Strategy } from './strategy';

export interface StrategyFactory<T extends Strategy> {
  /**
   * Build and returns a specific strategy, depending on the type
   * given as parameter
   *
   * @param type - The name of the kind of strategy wanted, given as a Symbol
   * @returns A new instance of the kind of strategy requested
   */
  getStrategy(type: symbol): T;
}
