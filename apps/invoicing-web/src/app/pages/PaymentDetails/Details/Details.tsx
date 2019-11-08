import { LayoutProps, SpaceProps } from "styled-system";
import React from "react";

import { Details as Root } from "./Details.styles";
import { ArticleDetails } from "./ArticleDetails";
import { InvoiceDetails } from "./InvoiceDetails";
import { Charges } from "./Charges";

interface Props extends LayoutProps, SpaceProps {
  articleDetailsExpanded?: boolean;
  invoiceDetailsExpanded?: boolean;
  articleDetails: any;
  invoiceDetails: any;
  charges: any;
}

const Details: React.FC<Props> = ({
  articleDetailsExpanded,
  invoiceDetailsExpanded,
  articleDetails,
  invoiceDetails,
  charges,
  ...rest
}) => (
  <Root {...rest}>
    <ArticleDetails
      articleDetails={articleDetails}
      expanded={articleDetailsExpanded}
    ></ArticleDetails>
    <InvoiceDetails
      invoiceDetails={invoiceDetails}
      expanded={invoiceDetailsExpanded}
    ></InvoiceDetails>
    <Charges charges={charges} mt="25"></Charges>
  </Root>
);

export default Details;
