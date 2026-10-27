export type IconsListProp =
  | "plus"
  | "menu1"
  | "wallet"
  | "double-chevron-right"
  | "camera"
  | "camera-lg"
  | "mute-on"
  | "mute-off"
  | "ticket"
  | "double-chevron-up"
  | "copy"
  | "settings"
  | "cross-icon-bold"
  | "plus-icon-inner-square"
  | "arrow-right"
  | "chevron-down"
  | "search"
  | "timer"
  | "percentage-box"
  | "arrow-down"
  | "ticket-fill"
  | "solana-body"
  | "swap-icon"
  | "refresh-icon"
  | "ticket-menu"
  | "expand"
  | "tutorial";

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  icon: IconsListProp;
  width?: number;
  height?: number;
};
