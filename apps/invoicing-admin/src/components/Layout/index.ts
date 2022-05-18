import { Layout } from './Layout';
import { LayoutContent } from './LayoutContent';
import { LayoutNavbar } from './LayoutNavbar';
import { LayoutSidebar } from './LayoutSidebar';
import { withPageConfig } from './withPageConfig';
import { setupPage } from './setupPage';

(Layout as any).Sidebar = LayoutSidebar;
(Layout as any).Navbar = LayoutNavbar;
(Layout as any).Content = LayoutContent;

export default Layout as any;
export { withPageConfig, setupPage };
