export class TransactionalManager {
  commits = new Map();

  registerCommit(commit: any) {
    this.commits.set(commit.getType(), commit);
  }

  get(name: symbol) {
    return this.commits.get(name);
  }

  commit() {
    const commits = this.commits;
    for (const [, c] of commits) {
      c.execute();
    }
  }
}
