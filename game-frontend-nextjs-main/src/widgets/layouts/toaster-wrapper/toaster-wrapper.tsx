import React from "react";
import { Toaster } from "react-hot-toast";

type ToasterWrapperProps = {};

const ToasterWrapper: React.FC<ToasterWrapperProps> = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "bg-red-500",
        duration: 5000,
        style: {
          background: "var(--system-modals)",
          color: "white",
        },
        success: {
          iconTheme: {
            primary: "white",
            secondary: "var(--system-modals)",
          },
          className: "red",
        },
        error: {
          iconTheme: {
            primary: "white",
            secondary: "var(--system-modals)",
          },
          className: "red",
        },
      }}
    />
  );
};
export default ToasterWrapper;
