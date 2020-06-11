import { NavbarOnly } from './NavbarOnly';
import { LayoutNavbar } from './components/LayoutNavbar';

(NavbarOnly as any).Navbar = LayoutNavbar;

export default NavbarOnly;
