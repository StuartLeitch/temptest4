// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

import {Editors} from './Editors';

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
  ): Result<EditorialBoard> {
    const defaultValues: EditorialBoardProps = {
      ...props,
      editors: props.editors ? props.editors : Editors.create([]),
      totalNumEditors: props.totalNumEditors
        ? props.totalNumEditors
        : props.editors
        ? props.editors.getItems().length
        : 0
    };
    const editorialBoard = new EditorialBoard(defaultValues, id);

    return Result.ok<EditorialBoard>(editorialBoard);
  }
}
