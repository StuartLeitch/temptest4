import React from 'react';
import {SpaceProps, LayoutProps} from 'styled-system';

import Icon from '../../Icon';
import {FormFieldProps} from '../CommonTypes';
import {Input as InputElement, RelativeParent} from '../CommonStyles';

export type InputTypes = 'text' | 'password';

export interface Props extends FormFieldProps, SpaceProps, LayoutProps {
  type?: InputTypes;
  placeholder?: string;
}

const Input: React.FunctionComponent<Props> = ({
  name,
  type,
  status,
  ...rest
}) => {
  return (
    <RelativeParent>
      <InputElement id={name} type={type} status={status} {...rest} />
      {status === 'warning' && (
        <Icon
          position="absolute"
          name="warningFilled"
          color="colors.warning"
          top={2}
          right={2}
        />
      )}
    </RelativeParent>
  );
};

Input.defaultProps = {
  type: 'text',
  status: 'none'
};

export default Input;
