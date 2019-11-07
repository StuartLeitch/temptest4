import React from 'react';

import {Label} from '../../Typography';
import {FlexProps, Flex} from '../../Flex';

export interface Props extends FlexProps {
  id?: string;
  name?: string;
  label?: string;
}

const Radio: React.FunctionComponent<Props> = ({id, label, name, ...rest}) => {
  return (
    <Flex {...rest}>
      <input id={id} name={name} type="radio" />
      <Label ml={1} htmlFor={id}>
        {label}
      </Label>
    </Flex>
  );
};

export default Radio;
