import React from 'react';

import Icon from '../../Icon';
import InputProps from '../InputProps';
import {SpaceProps, LayoutProps} from 'styled-system';
import {Input as Root, Container} from './Input.styles';

export type InputTypes = 'text' | 'password';
export type InputStatus = 'none' | 'success' | 'info' | 'warning';

export interface Props extends InputProps, SpaceProps, LayoutProps {
  type?: InputTypes;
  placeholder?: string;
  status?: InputStatus;
}

const Input: React.FunctionComponent<Props> = ({
  type,
  status,
  placeholder,
  // input props
  name,
  value,
  onBlur,
  onFocus,
  onChange,
  ...rest
}) => {
  return (
    <Container status={status} {...rest}>
      <Root
        name={name}
        type={type}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        placeholder={placeholder}
      />
      {(status === 'warning' || status === 'info') && (
        <Icon
          ml={1}
          name={status === 'warning' ? 'warningFilled' : 'infoFilled'}
          color={status === 'warning' ? 'colors.warning' : 'colors.info'}
        />
      )}
    </Container>
  );
};

Input.defaultProps = {
  type: 'text',
  status: 'none'
};

export default Input;
