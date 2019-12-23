import { LayoutProps, SpaceProps } from "styled-system";
import React from "react";

import { Details as Root } from "./Details.styles";
import { ArticleDetails } from "./ArticleDetails";
import { InvoiceDetails } from "./InvoiceDetails";
import { Charges } from "./Charges";

interface Props extends LayoutProps, SpaceProps {
  invoice: any;
}

const Details: React.FC<Props> = ({ invoice, ...rest }: any) => (
  <Root {...rest}>
    <ArticleDetails article={invoice.article} />
    <InvoiceDetails invoice={invoice} />
    <Charges invoiceItem={invoice.invoiceItem} mt="10" />
  </Root>
);

export default Details;
