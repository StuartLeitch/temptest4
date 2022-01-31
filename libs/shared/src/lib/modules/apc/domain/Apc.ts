import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';
import { Entity } from '../../../core/domain/Entity';

export interface ApcProps {
  journalName: string;
  journalCode: string;
  issn: string;
  publisher: string;
  price: string;
}

export class Apc extends Entity<ApcProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get journalName(): string {
    return this.props.journalName;
  }

  get journalCode(): string {
    return this.props.journalCode;
  }

  get issn(): string {
    return this.props.issn;
  }

  get publisher(): string {
    return this.props.publisher;
  }

  get price(): string {
    return this.props.price;
  }

  private constructor(props: ApcProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: ApcProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Apc> {
    return right(
      new Apc(
        {
          ...props,
        },
        id
      )
    );
  }
}
