import {KeyboardEvent, MouseEvent, FormEvent} from 'react';

export type FormFieldStatus = 'none' | 'success' | 'info' | 'warning';

type InputEvent =
  | FormEvent<HTMLElement>
  | KeyboardEvent<HTMLElement>
  | MouseEvent<HTMLElement>;

export interface FormField {
  status?: FormFieldStatus;
}

type ValidationStatuses = 'none' | 'success' | 'info' | 'error';

export interface FormFieldProps extends FormField {
  value?: any;
  name?: string;
  error?: string;
  onBlur?(e: InputEvent): void;
  onChange?(e: InputEvent): void;
  validationStatus?: ValidationStatuses;
}
