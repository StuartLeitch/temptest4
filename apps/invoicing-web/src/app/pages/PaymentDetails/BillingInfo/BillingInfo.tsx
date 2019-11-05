import React from "react";
import { Formik, Field } from "formik";
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
        <Flex inline={false} m={2} vertical>
          <Label required>Who is making the payment?</Label>
          <Flex width="100%">
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

          <Flex mt={2}>
            <FormField required label="First Name" name="firstName" mr={4} />
            <FormField required label="Last Name" name="lastName" mr={4} />
            <FormField required label="Email" name="email" />
          </Flex>

          <Flex width="100%" alignItems="flex-start" justifyContent="space-between">
            <FormField
              mr={2}
              flex={1}
              required
              name="address"
              label="Address"
              component={FormTextarea}
            />
            <Flex vertical>
              <FormField required label="Country" name="country" />
              <FormField required label="City" name="city" />
            </Flex>
          </Flex>

          <Button onClick={handleSubmit} size="medium">
            Create invoice
          </Button>
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
  width: fit-content;

  background-color: aliceblue;
`;
// #endregion
