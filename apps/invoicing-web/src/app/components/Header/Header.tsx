import React from "react";

import { Separator, Title } from "@hindawi/react-components";

import { config } from "../../../config";
import { Header as Root } from "./Header.styles";

interface Props {
  path: string;
}

const Header: React.FC<Props> = ({ path }) => (
  <Root>
    <img
      src={config.logoUrl}
      alt={config.tenantName}
      style={{ width: "150px" }}
    />
    <div style={{ height: "30px" }}>
      <Separator direction="vertical"></Separator>
    </div>
    <Title type="small">{path}</Title>
  </Root>
);

export default Header;
