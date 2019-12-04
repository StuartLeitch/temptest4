import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export function NotFound() {
  return (
    <Centered>
      Sorry&hellip; nothing here. <Link to="/">Go home</Link>
    </Centered>
  );
}

const Centered = styled.div`
  height: "100%",
  display: "grid",
  alignItems: "center",
  justifyContent: "center"
`;
