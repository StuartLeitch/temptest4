import {Result} from '../../../core/logic/Result';

import {Email} from './../../../domain/Email';
import {Name} from './../../../domain/Name';
import {EditorRole} from './../../../domain/EditorRole';

import {Journal} from './Journal';
import {Editor} from './Editor';
import {Editors} from './Editors';
import {EditorialBoard} from './EditorialBoard';

let journal: Journal;
let journalOrError: Result<Journal>;
let editor1: Editor;
let editor1OrError: Result<Editor>;
let editor2: Editor;
let editor2OrError: Result<Editor>;
let editorialBoard: EditorialBoard;
let editorialBoardOrError: Result<EditorialBoard>;

test('Should be able to assign an Editorial Board to Journal', () => {
  journalOrError = Journal.create({
    name: Name.create({value: 'journal-name'}).getValue(),
    email: Email.create({value: 'journal-email'}).getValue(),
    articleProcessingCharge: 666,
    code: 'journal-code',
    issn: 'journal-issn',
    isActive: false
  });
  expect(journalOrError.isSuccess).toBe(true);

  editor1OrError = Editor.create({
    name: Name.create({value: 'editor-1-name'}).getValue(),
    email: Email.create({value: 'editor-1-email'}).getValue(),
    role: EditorRole.create({
      label: 'editor-1-role-label',
      type: 'editor-1-role-type'
    }).getValue()
  });
  expect(editor1OrError.isSuccess).toBe(true);
  editor1 = editor1OrError.getValue();

  editor2OrError = Editor.create({
    name: Name.create({value: 'editor-2-name'}).getValue(),
    email: Email.create({value: 'editor-2-email'}).getValue(),
    role: EditorRole.create({
      label: 'editor-2-role-label',
      type: 'editor-2-role-type'
    }).getValue()
  });
  expect(editor2OrError.isSuccess).toBe(true);
  editor2 = editor2OrError.getValue();

  editorialBoardOrError = EditorialBoard.create({
    editors: Editors.create([editor1, editor2])
  });
  expect(editorialBoardOrError.isSuccess).toBe(true);
  editorialBoard = editorialBoardOrError.getValue();

  journal = journalOrError.getValue();

  // * magic happens here
  journal.editorialBoard = editorialBoard;

  expect(journal.editorialBoard.totalNumEditors).toBe(2);
  const editors = journal.editorialBoard.editors.getItems();
  expect(editors[0]).toBe(editor1);
  expect(editors[1]).toBe(editor2);
});
