import React from 'react';

import { FormFieldProps } from '../CommonTypes';

import { Textarea as Input } from './Textarea.styles';

type ResizeOptions = 'both' | 'none' | 'vertical' | 'horizontal';

export interface Props extends FormFieldProps {
  placeholder?: string;
  resize?: ResizeOptions;
  onFocus?:any;
}

const Textarea: React.FunctionComponent<Props> = ({
  name,
  status,
  resize,
  ...rest
}) => {
  return <Input id={name} status={status} resize={resize} {...rest} />;
};

Textarea.defaultProps = {
  resize: 'both'
};

export default Textarea;
