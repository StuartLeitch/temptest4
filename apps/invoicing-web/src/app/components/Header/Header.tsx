import React from "react";

import { Separator } from "@hindawi/react-components";

import { Header as Root } from "./Header.styles";

interface Props {}

const Header: React.FC<Props> = props => (
  <Root>
    <img src="../../assets/images/hindawi-horizontal.svg" alt="Hindawi" />
    <Separator direction="vertical"></Separator>
  </Root>
);

export default Header;
