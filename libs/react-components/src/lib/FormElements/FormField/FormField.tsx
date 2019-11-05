import React from 'react';
import {Field, FieldProps} from 'formik';
import {FlexboxProps, LayoutProps, SpaceProps} from 'styled-system';

import Input from '../Input';
import Flex from '../../Flex';
import {Label, Text} from '../../Typography';
import {FormFieldProps} from '../CommonTypes';

export interface Props extends FlexboxProps, LayoutProps, SpaceProps {
  name: string;
  label?: string;
  required?: boolean;
  component?: React.ComponentType<FormFieldProps>;
}

const FormField: React.FunctionComponent<Props> = ({
  name,
  label,
  required,
  component: Component,
  ...rest
}) => {
  return (
    <Field name={name}>
      {({field, form}: FieldProps) => {
        const error = form.errors[name];
        return (
          <Flex vertical {...rest}>
            <Label required={required} htmlFor={field.name}>
              {label}
            </Label>
            <Component
              name={field.name}
              status={error ? 'warning' : 'none'}
              {...field}
            />
            <Flex minHeight={6}>
              {error && <Text type="warning">{error}</Text>}
            </Flex>
          </Flex>
        );
      }}
    </Field>
  );
};

FormField.defaultProps = {
  component: Input
};

export default FormField;
