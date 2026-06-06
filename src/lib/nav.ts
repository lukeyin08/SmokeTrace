import {
  LayoutDashboard,
  LineChart,
  MapPin,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Primary navigation shown in the sidebar and the mobile bottom bar. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/triggers", label: "Triggers", icon: MapPin },
  { href: "/accountability", label: "Support", icon: Users },
];

/** Secondary items shown only in the sidebar / menu. */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];
