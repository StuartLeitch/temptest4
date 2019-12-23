import React, { Fragment } from "react";
import { useParams } from "react-router-dom";
import { set, isEmpty } from "lodash";
import { Formik } from "formik";
import {
  Flex,
  Label,
  Button,
  Textarea,
  FormField,
} from "@hindawi/react-components";

import { Modal, useModalActions } from "../../../providers/modal";
import { PAYMENT_TYPES } from "./types";
import CountryField from "./CountryField";
import StateField from "./StateField";
import IconRadioButton from "./IconRadioButton";
import ConfirmationModal from "./ConfirmationModal";
import VatChargesObserver from "./VATChargesObserver";

interface Props {
  payer: any;
  error: string;
  loading: boolean;
  couponError: string;
  handleSubmit(payer: any): any;
  onVatFieldChange(country: string, paymentType: string): any;
  applyCoupon(invoiceId: string, couponCode: string): any;
}

const FormTextarea = (field: any) => (
  <Textarea
    height={26}
    {...field}
    resize="vertical"
    style={{ resize: "none" }}
  />
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

const validateFn = (values: any) => {
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

  if (values.address.country === "US") {
    if (!values.address.state) {
      set(errors, "address.state", "Required");
    }
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
  couponError,
  loading,
  handleSubmit,
  onVatFieldChange,
  applyCoupon,
}: any) => {
  const { invoiceId } = useParams();
  const { showModal, hideModal } = useModalActions();

  if (!payer) {
    payer = {
      invoiceId,
      type: null,
      address: {
        country: "",
        state: "",
        city: "",
      },
      coupon: "",
    };
  }

  return (
    <Formik
      initialValues={payer}
      validate={validateFn}
      onSubmit={({ coupon, ...payer }) => handleSubmit({ invoiceId, ...payer })}
    >
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
            <VatChargesObserver
              country={values.address.country}
              paymentType={values.type}
              onChange={onVatFieldChange}
            />
            <Flex m={2} vertical>
              <Label required>Who is making the payment?</Label>
              <Flex mt={1} mb={4}>
                <IconRadioButton
                  isSelected={
                    values &&
                    values.type &&
                    values.type === PAYMENT_TYPES.individual
                  }
                  onClick={() =>
                    setFieldValue("type", PAYMENT_TYPES.individual)
                  }
                  icon="user"
                  label="Pay as Individual"
                  mr={1}
                />
                <IconRadioButton
                  isSelected={
                    values &&
                    values.type &&
                    values.type === PAYMENT_TYPES.institution
                  }
                  onClick={() =>
                    setFieldValue("type", PAYMENT_TYPES.institution)
                  }
                  icon="institution"
                  label="Pay as Institution"
                  ml={1}
                />
              </Flex>

              {values &&
                values.type &&
                values.type === PAYMENT_TYPES.institution && (
                  <Flex>
                    <FormField
                      mr={4}
                      flex={2}
                      required
                      label="Institution name"
                      name="organization"
                    />
                    <FormField label="EC VAT Reg. No" name="vatId" flex={1} />
                  </Flex>
                )}

              {values && values.type !== null && (
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
                      {values.address.country === "US" && (
                        <FormField
                          required
                          label="State"
                          name="address.state"
                          component={StateField}
                        />
                      )}
                      <FormField required label="City" name="address.city" />
                    </Flex>
                  </Flex>

                  <Flex justifyContent="space-between">
                    <Flex>
                      <FormField
                        error={couponError}
                        required
                        placeholder="Insert coupon code here"
                        label="Coupon"
                        name="coupon"
                      />
                      <Button
                        type="secondary"
                        disabled={!values.coupon}
                        size="medium"
                        mb="1"
                        ml="2"
                        onClick={() => {
                          applyCoupon(invoiceId, values.coupon);
                        }}
                      >
                        Apply
                      </Button>
                    </Flex>
                    <Flex justifyContent="flex-end">
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
                    </Flex>
                  </Flex>
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
