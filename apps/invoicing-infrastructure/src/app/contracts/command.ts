export interface Command {
  run(...args: string[]): Promise<void>;
}
