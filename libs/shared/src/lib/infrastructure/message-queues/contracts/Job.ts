import {ErrorHandlerContract} from './ErrorHandler';

export interface Job {
  getPayload(): any;
  done(): void;
  delete(): Promise<unknown>;
  isDeleted(): boolean;
  release(): Promise<unknown>;
  isReleased(): boolean;
}

export abstract class JobContract implements Job {
  protected errorHandler: ErrorHandlerContract;
  protected payload: any;
  protected deleted: boolean = false;
  protected released: boolean = false;

  constructor(errorHandler: ErrorHandlerContract, payload: any) {
    this.errorHandler = errorHandler;
    this.payload = payload;
  }

  public getPayload(): any {
    return this.payload;
  }

  public isDeleted(): boolean {
    return this.deleted;
  }

  public isReleased(): boolean {
    return this.released;
  }

  public done(): void {}
  public async delete(): Promise<unknown> {
    return;
  }
  public async release(): Promise<unknown> {
    return;
  }
}
