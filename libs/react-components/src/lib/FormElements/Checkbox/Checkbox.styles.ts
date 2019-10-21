import {space} from 'styled-system';
import styled from 'styled-components';

export const CheckboxContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  position: relative;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  ${space};
`;
