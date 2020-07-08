import { Command } from '../../contracts';

export class BuildManifestsCommand implements Command {
  async run(...args: string[]): Promise<void> {
    console.log('hello world');
  }
}
