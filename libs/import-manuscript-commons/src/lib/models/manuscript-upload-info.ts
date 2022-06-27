import {
  UniqueEntityID,
  AggregateRoot,
  GuardFailure,
  Entity, GuardFail,
} from '@hindawi/shared';

export enum ManuscriptStatus {
  VALIDATION_STARTED = 'VALIDATION_STARTED',
  UPLOAD_CONFIRMED = 'UPLOAD_CONFIRMED',
  SUBMITTED = 'SUBMITTED',
  ERROR = 'ERROR',
}

export class ManuscriptId extends Entity<unknown> {
  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): ManuscriptId {
    return new ManuscriptId(id);
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  toString(): string {
    return this._id.toString();
  }
}

export interface ManuscriptUploadProps {
  fileName: string;
  dateCreated: Date;
  dateUpdated: Date;
  status: ManuscriptStatus;
}

export class ManuscriptUploadInfo extends AggregateRoot<ManuscriptUploadProps> {
  private constructor(props: ManuscriptUploadProps, id: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: ManuscriptUploadProps,
    id: UniqueEntityID
  ): ManuscriptUploadInfo {
    const values = {
      ...props,
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
      dateUpdated: props.dateUpdated ? props.dateUpdated : new Date(),
    };
    const result = new ManuscriptUploadInfo(values, id);
    this.validateProp(result.id, 'id');
    this.validateProp(result.fileName, 'fileName');
    this.validateProp(result.status, 'status');
    return result;
  }

  private static validateProp(prop: unknown, propName: string): void {
    if (prop === null || prop === undefined)
      throw new GuardFail(`${propName} is null or undefined`);
  }

  public get fileName(): string {
    return this.props.fileName;
  }

  public set fileName(value: string) {
    this.props.fileName = value;
  }

  public get dateCreated(): Date {
    return this.props.dateCreated;
  }

  public set dateCreated(value: Date) {
    this.props.dateCreated = value;
  }

  public get dateUpdated(): Date {
    return this.props.dateUpdated;
  }

  public set dateUpdated(value: Date) {
    this.props.dateUpdated = value;
  }

  public get status(): ManuscriptStatus {
    return this.props.status;
  }

  public set status(value: ManuscriptStatus) {
    this.props.status = value;
  }
}
