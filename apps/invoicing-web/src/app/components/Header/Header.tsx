import React from "react";

import { Separator, Title } from "@hindawi/react-components";

import { Header as Root } from "./Header.styles";

interface Props {
  path: string;
}

const Header: React.FC<Props> = ({ path }) => (
  <Root>
    <img src="../../assets/images/hindawi-horizontal.svg" alt="Hindawi" />
    <div style={{ height: "30px" }}>
      <Separator direction="vertical"></Separator>
    </div>
    <Title type="small">{path}</Title>
  </Root>
);

export default Header;
