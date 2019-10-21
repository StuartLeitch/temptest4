import React, {useState} from 'react';
import {SpaceProps} from 'styled-system';

import Icon from '../../Icon';
import {Label} from '../../Typography';
import {CheckboxContainer} from './Checkbox.styles';

export interface Props extends SpaceProps {
  id?: string;
  label?: string;
  required?: boolean;
}

// TODO: remove state and refactor when creating the FormInput component
const Checkbox: React.FunctionComponent<Props> = ({
  id,
  label,
  required,
  ...rest
}) => {
  const [checked, setChecked] = useState(false);
  const toggleCheckbox = () => setChecked(s => !s);
  return (
    <CheckboxContainer {...rest}>
      <Icon
        mr={1}
        onClick={toggleCheckbox}
        color="colors.textPrimary"
        name={checked ? 'checkboxFilled' : 'checkbox'}
      />
      <input
        checked={checked}
        id={id}
        type="checkbox"
        required={required}
        onChange={toggleCheckbox}
      />
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
    </CheckboxContainer>
  );
};

export default Checkbox;
