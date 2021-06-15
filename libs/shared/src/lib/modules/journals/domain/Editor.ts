import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Guard } from '../../../core/logic/Guard';

import { EditorRole } from './../../../domain/EditorRole';
import { Email } from './../../../domain/Email';
import { Name } from './../../../domain/Name';

import { UserId } from '../../users/domain/UserId';
import { JournalId } from './JournalId';
import { EditorId } from './EditorId';

// * So far it's the only role that is assigned to chief editor
// * Should have a discount of 100%, rest of the roles being 50%
const CHIEF_EDITOR_ROLE = 'triageEditor';

export interface EditorProps {
  name: Name;
  email: Email;
  userId: UserId;
  journalId: JournalId;
  role: EditorRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EditorCollection = Editor[];

export class Editor extends AggregateRoot<EditorProps> {
  get editorId(): EditorId {
    return EditorId.create(this._id);
  }

  get name(): Name {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get role(): EditorRole {
    return this.props.role;
  }

  get journalId(): JournalId {
    return this.props.journalId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  private constructor(props: EditorProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: EditorProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Editor> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.email.props.value, argumentName: 'email' },
      { argument: props.role, argumentName: 'role' },
    ]);

    if (!nullGuard.succeeded) {
      return left(new GuardFailure(nullGuard.message));
    } else {
      const defaultEditorProps: EditorProps = {
        ...props,
      };

      const editor = new Editor(defaultEditorProps, id);

      return right(editor);
    }
  }

  isChiefEditor(): boolean {
    return this.props.role.type === CHIEF_EDITOR_ROLE;
  }
}
