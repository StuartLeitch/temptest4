import React from 'react';
import {SpaceProps, LayoutProps} from 'styled-system';

import {FormFieldProps} from '../CommonTypes';
import {Input as Root} from '../CommonStyles';

export type InputTypes = 'text' | 'password';

export interface Props extends FormFieldProps, SpaceProps, LayoutProps {
  type?: InputTypes;
  placeholder?: string;
}

const Input: React.FunctionComponent<Props> = ({id, type, status, ...rest}) => {
  return <Root id={id} type={type} status={status} {...rest} />;
};

Input.defaultProps = {
  type: 'text',
  status: 'none'
};

export default Input;
