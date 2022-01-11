import styled from "styled-components";
import React from "react";

import { config } from "../../../../config";

import { th } from "@hindawi/react-components";

interface Props {}

const Root = styled.div`
  width: calc(100% - ${th("gridUnit")} * 8 * 2);
  border-top: 1px solid ${th("colors.furniture")};

  padding-bottom: calc(${th("gridUnit")} * 3);
  padding-top: calc(${th("gridUnit")} * 3);

  margin-right: calc(${th("gridUnit")} * 8);
  margin-left: calc(${th("gridUnit")} * 8);

  justify-content: center;
  align-items: center;
  display: flex;

  a {
    margin-right: calc(${th("gridUnit")} * 3);
    color: ${th("colors.textPrimary")};

    &:last-child {
      margin-right: 0;
    }
  }

  span {
    color: ${th("colors.textPrimary")};
  }
`;

const PaymentFooter: React.FC<Props> = (props) => {
  return (
    <Root>
      <a target="_blank" rel="noopener noreferrer" href={config.footerHomeLink}>
        {config.tenantName}
      </a>
      <a target="_blank" rel="noopener noreferrer" href={config.footerPrivacy}>
        Privacy Policy
      </a>
      <a target="_blank" rel="noopener noreferrer" href={config.footerTOS}>
        Terms of Service
      </a>
      <span>
        Support:{" "}
        <a href={`mailto:${config.footerEmail}`}>{config.footerEmail}</a>
      </span>
    </Root>
  );
};

export default PaymentFooter;
