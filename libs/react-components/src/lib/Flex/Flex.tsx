import {
  space,
  layout,
  flexbox,
  position,
  SpaceProps,
  LayoutProps,
  FlexboxProps,
  PositionProps
} from 'styled-system';
import styled, {css, AnyStyledComponent} from 'styled-components';

export interface FlexProps
  extends LayoutProps,
    SpaceProps,
    FlexboxProps,
    PositionProps {
  inline?: boolean;
  vertical?: boolean;
}

const verticalFn = ({vertical}: {vertical: boolean}) => {
  if (vertical) {
    return css`
      align-items: flex-start;
      flex-direction: column;
      justify-content: flex-start;
    `;
  }

  return css`
    align-items: center;
    flex-direction: row;
    justify-content: center;
  `;
};

const Flex: AnyStyledComponent = styled.div`
  display: ${({inline}) => (inline ? 'inline-flex' : 'flex')};
  box-sizing: border-box;
  width: fit-content;

  ${verticalFn};
  ${space};
  ${layout};
  ${flexbox};
  ${position};
`;

Flex.defaultProps = {
  inline: true,
  vertical: false
};

export default Flex;
