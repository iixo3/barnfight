import Image from "next/image";
import Link from "next/link";
import React from "react";

type LogoProps = {
  onClick?: () => void;
};

const Logo: React.FC<LogoProps> = ({ onClick }) => {
  const handleEvent = () => {
    onClick && onClick();
  };

  return (
    <Link
      onClick={handleEvent}
      href={"/games"}
      className="appearance-none cursor-pointer"
    >
      <div className="relative w-[118px] h-10">
        <Image
          src="/images/barnFightLogo.webp"
          alt="logo"
          fill
          className="absolute"
          quality={100}
        />
      </div>
    </Link>
  );
};
export default Logo;
