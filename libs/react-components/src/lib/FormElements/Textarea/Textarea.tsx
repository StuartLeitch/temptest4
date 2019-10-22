import React from 'react';

import Icon from '../../Icon';
import {FormFieldProps} from '../CommonTypes';

export interface Props extends FormFieldProps {
  placeholder?: string;
}

import {Container, Input} from '../CommonStyles';

const Textarea: React.FunctionComponent<Props> = ({
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
    <Container
      status={status}
      height="100%"
      width="fit-content"
      position="relative"
      {...rest}
    >
      <Input
        as="textarea"
        name={name}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={onChange}
        placeholder={placeholder}
      />
      {(status === 'warning' || status === 'info') && (
        <Icon
          position="absolute"
          top={1}
          right={1}
          name={status === 'warning' ? 'warningFilled' : 'infoFilled'}
          color={status === 'warning' ? 'colors.warning' : 'colors.info'}
        />
      )}
    </Container>
  );
};

export default Textarea;
