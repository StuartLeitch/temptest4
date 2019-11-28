import React, { useMemo } from "react";

import { Expander } from "@hindawi/react-components";

import { DetailItem } from "../DetailItem";
import { InvoiceDetails as Root } from "./InvoiceDetails.styles";

interface Props {
  invoice: any;
}

const InvoiceDetails: React.FC<Props> = ({ invoice }) => {
  const issuedDate = useMemo(() => {
    if (!invoice.dateIssued) {
      return "-";
    } else {
      const d = new Date(invoice.dateIssued);
      return d.toLocaleString("en-INT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
  }, [invoice.dateIssued]);

  return (
    <Expander title="Invoice Details" expanded>
      <Root>
        <DetailItem label="Invoice Issue Date" text={issuedDate} />
        <DetailItem label="Date of Supply" text={issuedDate} />
        <DetailItem label="Reference Number" text={invoice.referenceNumber} />
        <DetailItem label="Terms" text="Payable upon Receipt" />
      </Root>
    </Expander>
  );
};

export default InvoiceDetails;
