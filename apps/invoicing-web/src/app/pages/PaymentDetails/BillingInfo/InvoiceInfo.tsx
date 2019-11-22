import React, { Fragment } from "react";
import countryList from "country-list";
import { Flex, Text, Label } from "@hindawi/react-components";

interface Props {
  name: string;
  email: string;
  organization: string;
  type: "INSTITUTION" | "INDIVIDUAL";
  address: {
    city: string;
    country: string;
    addressLine1: string;
  };
}

const InvoiceInfo: React.FunctionComponent<Props> = ({
  name,
  type,
  email,
  address,
  organization,
}) => {
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
          <Text>{countryList.getName((address && address.country) || "")}</Text>
        </Flex>
        <Flex vertical flex={1}>
          <Label>Address</Label>
          <Text>{address && address.addressLine1}</Text>
        </Flex>
      </Flex>
      {type === "INSTITUTION" && (
        <Flex vertical mt={2}>
          <Label>Organization</Label>
          <Text>{organization}</Text>
        </Flex>
      )}
    </Fragment>
  );
};

export default InvoiceInfo;
