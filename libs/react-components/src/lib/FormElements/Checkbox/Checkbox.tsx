import React from 'react';

import {Label} from '../../Typography';
import {Flex, FlexProps} from '../../Flex';

export interface Props extends FlexProps {
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
    <Flex {...rest}>
      <input id={id} type="checkbox" required={required} />
      <Label ml={1} htmlFor={id} required={required}>
        {label}
      </Label>
    </Flex>
  );
};

export default Checkbox;
