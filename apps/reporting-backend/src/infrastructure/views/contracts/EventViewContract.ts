import { WithDependencies } from '@hindawi/shared';

export interface EventViewContract extends WithDependencies {
  getCreateQuery(): String;
  getPostCreateQueries(): String[];
  getViewName(): String;
  addDependency(dep: EventViewContract): void;
}

export abstract class AbstractEventView implements WithDependencies {
  private dependecies = [] as EventViewContract[];
  abstract postCreateQueries = [];
  abstract getViewName(): string;
  abstract getCreateQuery(): string;

  getDeleteQuery(): string {
    return `DROP MATERIALIZED VIEW IF EXISTS ${this.getViewName()}`;
  }

  getRefreshQuery(): string {
    return `REFRESH MATERIALIZED VIEW ${this.getViewName()} WITH DATA`;
  }

  getPostCreateQueries(): string[] {
    return this.postCreateQueries;
  }

  addDependency(dep: EventViewContract): void {
    this.dependecies.push(dep);
  }

  getDependencies(): WithDependencies[] {
    return this.dependecies;
  }
}
