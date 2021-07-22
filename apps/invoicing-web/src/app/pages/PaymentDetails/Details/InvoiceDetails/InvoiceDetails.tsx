import format from "date-fns/format";
import { enGB } from "date-fns/locale";
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
      return format(new Date(invoice.dateIssued), "do MMMM yyyy", {
        locale: enGB,
      });
    }
  }, [invoice.dateIssued]);

  return (
    <Expander title="Invoice Details" expanded>
      <Root>
        <DetailItem label="Invoice Issue Date" text={issuedDate} />
        <DetailItem label="Reference Number" text={invoice.referenceNumber} />
        <DetailItem label="Terms" text="Payable upon Receipt" />
      </Root>
    </Expander>
  );
};

export default InvoiceDetails;
