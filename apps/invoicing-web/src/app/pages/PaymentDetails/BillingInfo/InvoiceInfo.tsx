import React, { Fragment } from "react";
import countryList from "country-list";
import stateList from "state-list";
import { Flex, Text, Label } from "@hindawi/react-components";

interface Props {
  name: string;
  email: string;
  vatId: string;
  organization: string;
  type: "INSTITUTION" | "INDIVIDUAL";
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
          <Text>
            {`${countryList.getName(
              (address && address.country) || "",
            )}${address &&
              address.state &&
              `, ${stateList.name[address.state]}`}`}
          </Text>
        </Flex>
        <Flex vertical flex={1}>
          <Label>Address</Label>
          <Text>{address && address.addressLine1}</Text>
        </Flex>
      </Flex>
      {type === "INSTITUTION" && (
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
