import React, { useRef } from "react";
import { Button, ButtonProps } from "../button/button";
import { Input } from "../input/input";

type InputFileProps = {
  children: React.ReactNode;
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
} & ButtonProps;

export const InputFile: React.FC<InputFileProps> = ({
  children,
  handleFileChange,
  accept = ".png,.jpg,.jpeg,.webp",
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button {...props} onClick={handleButtonClick}>
        {children}
      </Button>
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
      />
    </>
  );
};
