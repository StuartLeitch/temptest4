import {
  space,
  layout,
  flexbox,
  SpaceProps,
  LayoutProps,
  FlexboxProps
} from 'styled-system';
import styled, {AnyStyledComponent} from 'styled-components';

export interface FlexProps extends LayoutProps, SpaceProps, FlexboxProps {}

const Flex: AnyStyledComponent = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;

  ${flexbox};
  ${space};
  ${layout};
`;

export default Flex;
