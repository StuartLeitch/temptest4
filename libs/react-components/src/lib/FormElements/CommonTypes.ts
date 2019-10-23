import {KeyboardEvent, MouseEvent, FormEvent} from 'react';

export type FormFieldStatus = 'none' | 'success' | 'info' | 'warning';

type InputEvent =
  | FormEvent<HTMLElement>
  | KeyboardEvent<HTMLElement>
  | MouseEvent<HTMLElement>;

export interface FormField {
  status?: FormFieldStatus;
}

export interface FormFieldProps extends FormField {
  id?: string;
  value?: any;
  name?: string;
  error?: string;
  onBlur?(e: InputEvent): void;
  onFocus?(e: InputEvent): void;
  onChange?(e: InputEvent): void;
}
