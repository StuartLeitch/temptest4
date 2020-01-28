import { Selector } from '../selector';

export class MockSelector implements Selector<string> {
  private validKeys: string[];

  constructor(validKeys: string[] = []) {
    this.validKeys = validKeys;
  }

  shouldSelect(key: string): boolean {
    return this.validKeys.includes(key);
  }

  select(keys: string[]): string[] {
    return keys.filter(query => this.validKeys.includes(query));
  }
}
