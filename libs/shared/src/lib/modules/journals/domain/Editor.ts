import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import { Guard } from '../../../core/logic/Guard';

import { Email } from './../../../domain/Email';
import { Name } from './../../../domain/Name';
import { EditorRole } from './../../../domain/EditorRole';

// import {UserId} from '../../users/domain/userId';
// import {UserName} from '../../users/domain/userName';
// import {MemberCreated} from './events/memberCreated';

import { EditorId } from './EditorId';
import { UserId } from '../../users/domain/UserId';
import { JournalId } from './JournalId';

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
    return EditorId.create(this._id).getValue();
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
  ): Result<Editor> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.email.props.value, argumentName: 'email' },
      { argument: props.role, argumentName: 'role' },
    ]);

    if (!nullGuard.succeeded) {
      return Result.fail<Editor>(nullGuard.message);
    } else {
      const defaultEditorProps: EditorProps = {
        ...props,
      };

      const editor = new Editor(defaultEditorProps, id);

      return Result.ok<Editor>(editor);
    }
  }

  isChiefEditor(): boolean {
    return this.props.role.type === CHIEF_EDITOR_ROLE;
  }
}
