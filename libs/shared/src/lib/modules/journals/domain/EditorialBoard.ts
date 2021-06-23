// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

import { Editors } from './Editors';

interface EditorialBoardProps {
  editors?: Editors;
  totalNumEditors?: number;
}

export class EditorialBoard extends AggregateRoot<EditorialBoardProps> {
  get editors(): Editors {
    return this.props.editors;
  }

  get totalNumEditors(): number {
    return this.props.totalNumEditors;
  }

  private constructor(props: EditorialBoardProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: EditorialBoardProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, EditorialBoard> {
    const defaultValues: EditorialBoardProps = {
      ...props,
      editors: props.editors ? props.editors : Editors.create([]),
      totalNumEditors: props.totalNumEditors
        ? props.totalNumEditors
        : props.editors
        ? props.editors.getItems().length
        : 0,
    };
    const editorialBoard = new EditorialBoard(defaultValues, id);

    return right(editorialBoard);
  }
}
