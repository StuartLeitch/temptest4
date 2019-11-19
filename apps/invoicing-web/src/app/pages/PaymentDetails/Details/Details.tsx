import { LayoutProps, SpaceProps } from "styled-system";
import React from "react";

import { Details as Root } from "./Details.styles";
import { ArticleDetails } from "./ArticleDetails";
import { InvoiceDetails } from "./InvoiceDetails";
import { Charges } from "./Charges";

interface Props extends LayoutProps, SpaceProps {
  invoiceDetails: any;
  charges: any;
}

const Details: React.FC<Props> = ({ invoiceDetails, charges, ...rest }) => (
  <Root {...rest}>
    <ArticleDetails article={invoiceDetails.article} />
    <InvoiceDetails invoiceDetails={invoiceDetails} />
    <Charges charges={charges} mt="10"></Charges>
  </Root>
);

export default Details;
