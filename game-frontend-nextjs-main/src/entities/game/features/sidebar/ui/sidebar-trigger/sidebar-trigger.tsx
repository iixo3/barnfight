"use client";

import { useGetAuth } from "@/shared/hooks/auth/use-get-auth";
import { useMutationObserver } from "@/shared/hooks/basic/use-mutation-observer";
import SidebarDrawer from "@/widgets/layouts/sidebar-drawer/sidebar-drawer";
import { sidebarButtonVariants } from "@/widgets/layouts/sidebar/sidebar-motion-variants";
import { motion } from "framer-motion";
import React, { use, useCallback, useState } from "react";

type SidebarTriggerProps = {};

const SidebarTrigger: React.FC<SidebarTriggerProps> = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const { isAuthenticated, user } = useGetAuth();

  const sidebarTriggerRef = useMutationObserver<HTMLDivElement>((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-active-sidebar"
      ) {
        const sidebarState = (mutation.target as HTMLDivElement).getAttribute(
          "data-active-sidebar"
        );

        setOpenSidebar(sidebarState === "true");
        break;
      }
    }
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div
      ref={sidebarTriggerRef}
      variants={sidebarButtonVariants}
      initial="show"
      animate={openSidebar ? "hide" : "show"}
      className="fixed md-game:absolute left-0 mt-[40vh] md-game:mt-32 z-10"
      id="sidebar-trigger-outside-btn"
    >
      <SidebarDrawer user={user} />
    </motion.div>
  );
};
export default SidebarTrigger;
