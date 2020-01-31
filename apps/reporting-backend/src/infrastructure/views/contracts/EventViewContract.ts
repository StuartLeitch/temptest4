import { WithDependencies } from 'libs/shared/src/lib/utils/OrderUtils';

export interface EventViewContract extends WithDependencies {
  getCreateQuery(): String;
  getPostCreateQueries(): String[];
  getViewName(): String;
  addDependency(dep: EventViewContract): void;
}

export abstract class AbstractEventView implements WithDependencies {
  private dependecies = [] as EventViewContract[];
  abstract postCreateQueries = [];
  abstract getCreateQuery(): string;
  abstract getViewName(): string;
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
