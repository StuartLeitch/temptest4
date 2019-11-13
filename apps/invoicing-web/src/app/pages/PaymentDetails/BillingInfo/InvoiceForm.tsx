import React, { Fragment } from "react";
import { set, isEmpty } from "lodash";
import { Formik } from "formik";
import {
  Flex,
  Label,
  Button,
  Textarea,
  FormField,
} from "@hindawi/react-components";

import { PAYMENT_TYPES } from "./types";
import CountryField from "./CountryField";
import IconRadioButton from "./IconRadioButton";
import ConfirmationModal from "./ConfirmationModal";
import { Modal, useModalActions } from "../../../providers/modal";

interface Props {
  payer: any;
  error: string;
  loading: boolean;
  handleSubmit(payer: any): any;
}

const FormTextarea = field => (
  <Textarea height={26} {...field} resize="vertical" />
);

const parseErrors = (errors, prefix = "") => {
  return Object.entries(errors).reduce((acc, [key, value]) => {
    if (typeof value === "object") {
      return { ...acc, ...parseErrors(value, `${prefix}${key}.`) };
    } else {
      return {
        ...acc,
        [`${prefix}${key}`]: true,
      };
    }
  }, {});
};

const imperativeValidation = (formFns, showModal) => () => {
  formFns.validateForm().then(errors => {
    const errorFields = parseErrors(errors);
    if (isEmpty(errorFields)) {
      showModal();
    } else {
      formFns.setTouched(errorFields);
    }
  });
};

const validateFn = values => {
  const errors: any = {};

  if (!values.name) {
    errors.name = "Required";
  }

  if (!values.email) {
    errors.email = "Required";
  }
  if (!values.address.country) {
    set(errors, "address.country", "Required");
  }
  if (!values.address.city) {
    set(errors, "address.city", "Required");
  }
  if (!values.address.addressLine1) {
    set(errors, "address.addressLine1", "Required");
  }

  if (values.type === PAYMENT_TYPES.institution && !values.organization) {
    errors.organization = "Required";
  }

  return errors;
};

const InvoiceForm: React.FunctionComponent<Props> = ({
  payer,
  error,
  loading,
  handleSubmit,
}) => {
  const { showModal, hideModal } = useModalActions();
  return (
    <Formik initialValues={payer} validate={validateFn} onSubmit={handleSubmit}>
      {({
        values,
        setTouched,
        handleSubmit,
        validateForm,
        setFieldValue,
        errors,
      }) => {
        return (
          <Fragment>
            <Flex m={2} vertical>
              <Label required>Who is making the payment?</Label>
              <Flex mt={1} mb={4}>
                <IconRadioButton
                  isSelected={values.type === PAYMENT_TYPES.individual}
                  onClick={() =>
                    setFieldValue("type", PAYMENT_TYPES.individual)
                  }
                  icon="user"
                  label="Pay as Individual"
                  mr={1}
                />
                <IconRadioButton
                  isSelected={values.type === PAYMENT_TYPES.institution}
                  onClick={() =>
                    setFieldValue("type", PAYMENT_TYPES.institution)
                  }
                  icon="institution"
                  label="Pay as Institution"
                  ml={1}
                />
              </Flex>

              {values.type === PAYMENT_TYPES.institution && (
                <Flex>
                  <FormField
                    mr={4}
                    flex={2}
                    required
                    label="Institution name"
                    name="organization"
                  />
                  <FormField label="EC VAT Reg. No" name="vat" flex={1} />
                </Flex>
              )}

              {values.type !== null && (
                <Fragment>
                  <Flex>
                    <FormField
                      mr={4}
                      flex={2}
                      required
                      name="name"
                      label="Name"
                    />

                    <FormField required label="Email" name="email" flex={1} />
                  </Flex>

                  <Flex alignItems="flex-start" justifyContent="space-between">
                    <FormField
                      flex={2}
                      required
                      name="address.addressLine1"
                      label="Address"
                      component={FormTextarea}
                    />
                    <Flex vertical flex={1} ml={4}>
                      <FormField
                        required
                        label="Country"
                        name="address.country"
                        component={CountryField}
                      />
                      <FormField required label="City" name="address.city" />
                    </Flex>
                  </Flex>

                  <Button
                    onClick={imperativeValidation(
                      {
                        setTouched,
                        validateForm,
                      },
                      showModal,
                    )}
                    size="medium"
                    alignSelf="flex-end"
                  >
                    Confirm Invoice
                  </Button>
                </Fragment>
              )}
            </Flex>
            <Modal>
              <ConfirmationModal
                error={error}
                loading={loading}
                onCancel={hideModal}
                onAccept={handleSubmit}
              />
            </Modal>
          </Fragment>
        );
      }}
    </Formik>
  );
};

export default InvoiceForm;
