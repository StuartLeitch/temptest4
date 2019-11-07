import React from "react";

import { Expander } from "@hindawi/react-components";

import { DetailItem } from "../DetailItem";
import { InvoiceDetails as Root } from "./InvoiceDetails.styles";

interface Props {
  invoiceDetails: any;
}

const InvoiceDetails: React.FC<Props> = ({ invoiceDetails }) => (
  <Expander title="Invoice Details" expanded={false}>
    <Root>
      <DetailItem label="Invoice Issue Date" text={invoiceDetails.issueDate}></DetailItem>
      <DetailItem label="Date of Supply" text={invoiceDetails.supplyDate}></DetailItem>
      <DetailItem label="Reference Number" text={invoiceDetails.referenceNumber}></DetailItem>
      <DetailItem label="Terms" text={invoiceDetails.terms}></DetailItem>
    </Root>
  </Expander>
);

export default InvoiceDetails;
