"use client";

import Logo from "@/shared/ui/components/layouts/logo/logo";
import React from "react";
import ConfettiWrapper from "../confetti-wrapper/confetti-wrapper";
import NavbarMenu from "./ui/navbar-menu";

type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <>
      <nav className="w-full min-h-[68px] h-[68px] sticky top-0 flex items-center justify-center gap-3 px-6 backdrop-blur-lg z-[50] bg-component-main rounded-bl-[20px] rounded-br-[20px] border-[0.6px] border-component-highlight">
        <Logo />

        <div className="bg-component-highlight h-[0.6px] flex-1"></div>

        <NavbarMenu />
      </nav>

      {/* <ConfettiWrapper /> */}
    </>
  );
};
export default Navbar;
