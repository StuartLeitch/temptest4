import React, { Fragment } from "react";
import countryList from "country-list";
import stateList from "state-list";
import { COUNTRY_CODES, PAYMENT_TYPES } from "./types";
import { Flex, Text, Label } from "@hindawi/react-components";

interface Props {
  name: string;
  email: string;
  vatId: string;
  organization: string;
  type: string;
  address: {
    city: string;
    state: string;
    country: string;
    addressLine1: string;
  };
}

const InvoiceInfo: React.FunctionComponent<Props> = ({
  name,
  type,
  email,
  vatId,
  address,
  organization,
}: any) => {
  console.log(address);
  return (
    <Fragment>
      <Flex>
        <Flex vertical flex={1}>
          <Label>Name</Label>
          <Text>{name}</Text>
        </Flex>
        <Flex vertical flex={1}>
          <Label>Email</Label>
          <Text>{email}</Text>
        </Flex>
        <Flex vertical flex={1}>
          <Label>Payer type</Label>
          <Text>{type}</Text>
        </Flex>
      </Flex>
      <Flex mt={2}>
        <Flex vertical flex={1}>
          <Label>City</Label>
          <Text>{address && address.city}</Text>
        </Flex>
        <Flex vertical flex={1}>
          <Label>Country</Label>

          {isNonISOCompatibleCountryCode(address) ? (
            <Text>{countryList.getName(COUNTRY_CODES.GB)}</Text>
          ) : (
            <Text>
              {`${countryList.getName((address && address.country) || "")}${
                address && address.country === COUNTRY_CODES.US && address.state
                  ? `, ${stateList.name[address.state]}`
                  : ""
              }
              ${
                address &&
                address.country === COUNTRY_CODES.US &&
                address.postalCode
                  ? `, ${address.postalCode}`
                  : ""
              }
              `}
            </Text>
          )}
        </Flex>
        <Flex vertical flex={1}>
          <Label>Address</Label>
          <Text>{address && address.addressLine1}</Text>
        </Flex>
      </Flex>
      {type === PAYMENT_TYPES.institution && (
        <Flex mt={2}>
          <Flex vertical flex={1}>
            <Label>Institution name</Label>
            <Text>{organization}</Text>
          </Flex>
          <Flex vertical flex={1}>
            <Label>EC VAT Reg. No</Label>
            <Text>{vatId}</Text>
          </Flex>
          <Flex flex={1}></Flex>
        </Flex>
      )}
    </Fragment>
  );
};

export default InvoiceInfo;

function isNonISOCompatibleCountryCode(address: any) {
  return address?.country === COUNTRY_CODES.UK;
}
