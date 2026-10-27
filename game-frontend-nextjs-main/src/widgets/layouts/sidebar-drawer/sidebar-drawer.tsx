import SidebarContent from "@/entities/game/features/sidebar/ui/sidebar-content/sidebar-content";
import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { useToggle } from "@/shared/hooks/use-toggle";
import { User } from "@/shared/types/user/user";
import { Button } from "@/shared/ui/components/button/button";
import {
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/components/dialog/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/components/drawer/drawer";
import Icon from "@/shared/ui/components/icon/icon";
import React from "react";

type SidebarDrawerProps = {
  user?: User;
};

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ user }) => {
  const { on, off, value: sidebarState } = useToggle();

  return (
    <Drawer direction="left" open={sidebarState} onOpenChange={on}>
      <DrawerTrigger asChild>
        <Button
          size="sidebar_trigger"
          className={
            "bg-system-modals md-game:bg-component-main cursor-pointer"
          }
        >
          <Icon
            icon="double-chevron-right"
            className="fill-text-secondary group-hover:fill-white"
            width={15}
            height={15}
          />
        </Button>
      </DrawerTrigger>
      <DialogTitle className="hidden">
        <></>
      </DialogTitle>
      <DialogDescription className="hidden">
        <></>
      </DialogDescription>

      <DrawerContent className="h-[93vh] mt-8 max-w-[330px]">
        <div className="relative flex overflow-hidden grow-0 shrink-0 h-full">
          <div className="w-full">
            <SidebarContent user={user} />

            <Button
              onClick={off}
              size="sidebar_right"
              className="absolute top-2 right-0 mt-8"
            >
              <Icon
                icon="double-chevron-right"
                className="fill-text-secondary group-hover:fill-white rotate-180"
                width={15}
                height={15}
              />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
export default SidebarDrawer;
