import { SidebarMenu } from './SidebarMenu';
import { SidebarMenuItem } from './SidebarMenuItem';

(SidebarMenu as any).Item = SidebarMenuItem;

export default SidebarMenu;
