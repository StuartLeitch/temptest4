import styled from "styled-components";

export const Overlay = styled.div`
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: fixed;

  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  z-index: 100;

  * {
    box-sizing: border-box;
  }
`;
