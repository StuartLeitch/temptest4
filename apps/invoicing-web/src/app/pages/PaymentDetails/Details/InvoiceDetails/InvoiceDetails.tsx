import format from "date-fns/format";
import { enGB } from "date-fns/locale";
import React, { useMemo } from "react";

import { Expander, Button } from "@hindawi/react-components";

import { DetailItem } from "../DetailItem";
import { InvoiceDetails as Root } from "./InvoiceDetails.styles";
import { config } from "@hindawi/invoicing-web/config";

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
        {isConfirmed(invoice) && downloadInvoice(invoice.payer.id)}
      </Root>
    </Expander>
  );
};

function isConfirmed(invoice: any) {
  return invoice.status !== "DRAFT";
}

function downloadInvoice(payerId: string) {
  return (
    <>
      <a href={`${config.apiRoot}/invoice/${payerId}`}>
        <Button type="outline" size="medium" onClick={null} mr={3} mt={3}>
          Download Invoice
        </Button>
      </a>
    </>
  );
}

export default InvoiceDetails;
