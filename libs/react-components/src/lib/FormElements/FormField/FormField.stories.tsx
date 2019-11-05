import React from 'react';
import {Formik} from 'formik';

import Button from '../../Button';
import FormField from './FormField';

export const Default = () => (
  <Formik
    validate={() => {
      return {
        email: 'Required'
      };
    }}
    initialValues={{email: 'alexandru.munt@gmail.com'}}
    onSubmit={() => {}}
  >
    {props => {
      return (
        <div>
          <FormField required label="Email" name="email" mr={2} />
          <FormField label="Password" name="password" />
          <Button type="secondary" size="medium" onClick={props.handleSubmit}>
            Submit
          </Button>
        </div>
      );
    }}
  </Formik>
);

export default {
  title: 'Form Elements|FormField',
  component: FormField
};
