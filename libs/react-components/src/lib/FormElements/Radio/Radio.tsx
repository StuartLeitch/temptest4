import React from 'react';
import {SpaceProps} from 'styled-system';

import {Label} from '../../Typography';
import {RadioContainer} from './Radio.styles';

export interface Props extends SpaceProps {
  id?: string;
  name?: string;
  label?: string;
}

const Radio: React.FunctionComponent<Props> = ({id, label, name, ...rest}) => {
  return (
    <RadioContainer {...rest}>
      <input id={id} name={name} type="radio" />
      <Label ml={1} htmlFor={id}>
        {label}
      </Label>
    </RadioContainer>
  );
};

export default Radio;
