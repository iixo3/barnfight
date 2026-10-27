"use client";

import { useToggle } from "@/shared/hooks/use-toggle";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import { cn } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import {
  sidebarButtonVariants,
  sidebarContentVariants,
  sidebarVariants,
} from "./sidebar-motion-variants";
import SidebarContent from "@/entities/game/features/sidebar/ui/sidebar-content/sidebar-content";
import { unstable_noStore } from "next/cache";
import { env } from "@/shared/lib/config/env";
import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";

// export async function getCompetition() {
//   unstable_noStore();

//   try {
//     await new Promise((resolve) => setTimeout(resolve, Number(env.TIMEOUT)));

//     const data: any = {

//     };

//     return data;
//   } catch (err) {
//     console.log("err", err);
//   }
// }
export default function Sidebar() {

  const {user, isAuthenticated} = useGetAuth()
  const {
    value: openSidebar,
    on: onOpenSidebar,
    off: onCloseSidebar,
  } = useToggle();

  const handleOpenSidebar = () => {
    document
      .getElementById("sidebar-trigger-outside-btn")
      ?.setAttribute("data-active-sidebar", "true");
    onOpenSidebar();
  };

  const handleCloseSidebar = () => {
    document
      .getElementById("sidebar-trigger-outside-btn")
      ?.setAttribute("data-active-sidebar", "false");
    onCloseSidebar();
  };

  return (
    <>
      <button
        onClick={handleOpenSidebar}
        type="button"
        hidden
        id="sidebar-trigger-on"
        data-active-sidebar={openSidebar}
      ></button>

      <AnimatePresence>
        <motion.div
          initial="closed"
          variants={sidebarVariants}
          animate={openSidebar ? "open" : "closed"}
          className={cn(
            "relative overflow-hidden grow-0 shrink-0 h-full flex bg-component-main rounded-xl"
          )}
        >
          <motion.div
            initial="closed"
            variants={sidebarContentVariants}
            className="w-full"
            animate={openSidebar ? "open" : "closed"}
          >
            <SidebarContent
              user={user}
              //@ts-ignore
              games={[]}
            />

            <Button
              onClick={handleCloseSidebar}
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
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
