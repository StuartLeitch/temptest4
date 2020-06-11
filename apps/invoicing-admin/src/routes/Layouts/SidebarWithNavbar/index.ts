import { SidebarWithNavbar } from './SidebarWithNavbar';
import {
    SidebarWithNavbarNavbar
} from '../../../layout/components/SidebarWithNavbarNavbar';
import {
    DefaultSidebar
} from '../../../layout/components/DefaultSidebar';

(SidebarWithNavbar as any).Navbar = SidebarWithNavbarNavbar;
(SidebarWithNavbar as any).Sidebar = DefaultSidebar;

export default SidebarWithNavbar;
