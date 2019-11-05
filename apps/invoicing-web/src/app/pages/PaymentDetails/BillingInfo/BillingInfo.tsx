import React from "react";
import { Formik } from "formik";
import styled from "styled-components";
import { Button, Label, Flex, FormField, Textarea, th } from "@hindawi/react-components";

const FormTextarea = field => <Textarea height={26} id={field.name} {...field} resize="vertical" />;

const BillingInfo = () => (
  <Root>
    <Label>Who is making the payment?</Label>
    <Formik initialValues={{}} onSubmit={(...args) => console.log("submitting form", args)}>
      {({ handleSubmit }) => (
        <Flex alignItems="flex-end" inline={false} m={2} vertical>
          <Flex>
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
  background-color: #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: calc(${th("gridUnit")} * 4);
  width: fit-content;
`;
// #endregion
