import React, { useMemo } from "react";

import { Expander } from "@hindawi/react-components";

import { DetailItem } from "../DetailItem";
import { InvoiceDetails as Root } from "./InvoiceDetails.styles";

interface Props {
  invoice: any;
}

const InvoiceDetails: React.FC<Props> = ({ invoice }) => {
  const parsedDate = useMemo(() => {
    const d = new Date(invoice.dateCreated);

    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }, [invoice.dateCreated]);

  return (
    <Expander title="Invoice Details" expanded>
      <Root>
        <DetailItem label="Invoice Issue Date" text={parsedDate} />
        <DetailItem label="Date of Supply" text={parsedDate} />
        <DetailItem label="Reference Number" text={invoice.referenceNumber} />
        <DetailItem label="Terms" text="Payable upon Receipt" />
      </Root>
    </Expander>
  );
};

export default InvoiceDetails;
