import React from 'react';
import {SpaceProps} from 'styled-system';

import {Label} from '../../Typography';
import {CheckboxContainer} from './Checkbox.styles';

export interface Props extends SpaceProps {
  id?: string;
  label?: string;
  required?: boolean;
}

const Checkbox: React.FunctionComponent<Props> = ({
  id,
  label,
  required,
  ...rest
}) => {
  return (
    <CheckboxContainer {...rest}>
      <input id={id} type="checkbox" required={required} />
      <Label ml={1} htmlFor={id} required={required}>
        {label}
      </Label>
    </CheckboxContainer>
  );
};

export default Checkbox;
