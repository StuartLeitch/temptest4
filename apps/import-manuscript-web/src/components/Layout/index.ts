import { Layout } from './Layout';
import { LayoutContent } from './LayoutContent';
import { LayoutHeader } from './LayoutHeader';
import { LayoutFooter } from './LayoutFooter';
import { LayoutNavbar } from './LayoutNavbar';

(Layout as any).Header = LayoutHeader;
(Layout as any).Footer = LayoutFooter;
(Layout as any).Content = LayoutContent;
(Layout as any).Navbar = LayoutNavbar;

export default Layout as any;
