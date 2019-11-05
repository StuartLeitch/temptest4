import React, { Fragment } from "react";
import { Formik } from "formik";
import styled from "styled-components";
import { Button, Label, Flex, FormField, Textarea, th } from "@hindawi/react-components";

import IconRadioButton from "./IconRadioButton";

const FormTextarea = field => <Textarea height={26} {...field} resize="vertical" />;

const validateFn = values => {
  const errors: any = {};

  if (!values.firstName) {
    errors.firstName = "Required";
  }
  if (!values.lastName) {
    errors.lastName = "Required";
  }
  if (!values.email) {
    errors.email = "Required";
  }
  if (!values.country) {
    errors.country = "Required";
  }
  if (!values.city) {
    errors.city = "Required";
  }
  if (!values.address) {
    errors.address = "Required";
  }

  return errors;
};

const BillingInfo = () => (
  <Root>
    <Formik
      initialValues={{}}
      validate={validateFn}
      onSubmit={(...args) => console.log("submitting form", args)}
    >
      {({ handleSubmit, setFieldValue, values }) => (
        <Flex m={2} vertical>
          <Label required>Who is making the payment?</Label>
          <Flex>
            <IconRadioButton
              isSelected={values.paymentType === "individual"}
              onClick={() => setFieldValue("paymentType", "individual")}
              icon="user"
              label="Pay as Individual"
              mr={1}
            />
            <IconRadioButton
              isSelected={values.paymentType === "institution"}
              onClick={() => setFieldValue("paymentType", "institution")}
              icon="institution"
              label="Pay as Institution"
              ml={1}
            />
          </Flex>

          {values.paymentType !== undefined && (
            <Fragment>
              <Flex mt={2}>
                <FormField required label="First Name" name="firstName" mr={4} />
                <FormField required label="Last Name" name="lastName" mr={4} />
                <FormField required label="Email" name="email" />
              </Flex>

              <Flex alignItems="flex-start" justifyContent="space-between">
                <FormField
                  flex={2}
                  required
                  name="address"
                  label="Address"
                  component={FormTextarea}
                />
                <Flex vertical flex={1} ml={4}>
                  <FormField required label="Country" name="country" />
                  <FormField required label="City" name="city" />
                </Flex>
              </Flex>

              <Button onClick={handleSubmit} size="medium" alignSelf="flex-end">
                Create invoice
              </Button>
            </Fragment>
          )}
        </Flex>
      )}
    </Formik>
  </Root>
);

export default BillingInfo;

// #region styles
const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: calc(${th("gridUnit")} * 4);

  background-color: aliceblue;
`;
// #endregion
