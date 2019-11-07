import React from "react";

import { Details as Root } from "./Details.styles";
import { ArticleDetails } from "./ArticleDetails";
import { InvoiceDetails } from "./InvoiceDetails";

interface Props {
  articleDetails: any;
  invoiceDetails: any;
}

const Details: React.FC<Props> = ({ articleDetails, invoiceDetails }) => (
  <Root>
    <ArticleDetails articleDetails={articleDetails}></ArticleDetails>
    <InvoiceDetails invoiceDetails={invoiceDetails}></InvoiceDetails>
  </Root>
);

export default Details;
