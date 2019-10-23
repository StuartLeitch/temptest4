import React from 'react';
import {LayoutProps, SpaceProps} from 'styled-system';

import Input from '../Input';
import Icon from '../../Icon';
import Flex from '../../Flex';
import {Label, Text} from '../../Typography';
import {FormFieldProps} from '../CommonTypes';

export interface Props extends FormFieldProps, LayoutProps, SpaceProps {
  id?: string;
  label?: string;
  required?: boolean;
  type?: 'text' | 'password';
  component?: React.ComponentType<FormFieldProps>;
}

const FormField: React.FunctionComponent<Props> = ({
  id,
  error,
  label,
  status,
  required,
  component: Component,
  ...rest
}) => {
  const hasIssue = status === 'warning' || status === 'info';
  return (
    <Flex position="relative" vertical {...rest}>
      <Label required={required} htmlFor={id}>
        {label}
      </Label>
      <Component id={id} status={status} {...rest} />
      {hasIssue && (
        <Icon
          top={6}
          right={2}
          position="absolute"
          name={status === 'warning' ? 'warningFilled' : 'infoFilled'}
          color={status === 'warning' ? 'colors.warning' : 'colors.info'}
        />
      )}
      <Flex minHeight={5}>
        {hasIssue && <Text type={status}>{error}</Text>}
      </Flex>
    </Flex>
  );
};

FormField.defaultProps = {
  width: 40,
  component: Input
};

export default FormField;
