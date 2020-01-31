import { Selector } from '../selector';
export declare class MockSelector implements Selector<string> {
    private validKeys;
    constructor(validKeys?: string[]);
    shouldSelect(key: string): boolean;
    select(keys: string[]): string[];
}
