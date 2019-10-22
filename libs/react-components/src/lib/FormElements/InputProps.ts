import {KeyboardEvent, MouseEvent, FormEvent} from 'react';

type InputEvent =
  | FormEvent<HTMLElement>
  | KeyboardEvent<HTMLElement>
  | MouseEvent<HTMLElement>;

export default interface InputProps {
  value?: any;
  name?: string;
  onBlur?(e: InputEvent): void;
  onFocus?(e: InputEvent): void;
  onChange?(e: InputEvent): void;
}
