import { Sidebar } from './Sidebar';
import { SidebarSection } from './SidebarSection';
import { SidebarClose } from './SidebarClose';
import { SidebarMobileFluid } from './SidebarMobileFluid';
import { SidebarShowSlim } from './SidebarShowSlim';
import { SidebarHideSlim } from './SidebarHideSlim';

(Sidebar as any).Section = SidebarSection;
(Sidebar as any).Close = SidebarClose;
(Sidebar as any).MobileFluid = SidebarMobileFluid;
(Sidebar as any).ShowSlim = SidebarShowSlim;
(Sidebar as any).HideSlim = SidebarHideSlim;

export default Sidebar;
