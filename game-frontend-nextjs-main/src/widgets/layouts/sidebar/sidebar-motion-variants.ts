export const sidebarContentVariants = {
  closed: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.1,
    },
  },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
    },
  },
};

export const sidebarVariants = {
  closed: {
    width: "40px",
    flexBasis: "0px",
    // flexGrow: 0,
    // flexShrink: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      delay: 0.2,
    },
    display: "none",
  },
  open: {
    flexBasis: "300px",
    width: "auto",
    // flexGrow: 0,
    // flexShrink: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
    display: "flex",
  },
};

export const sidebarButtonVariants = {
  show: {
    opacity: 1,
    transition: {
      delay: 0.3,
    },
  },
  hide: {
    opacity: 0,
    transition: {
      delay: 0,
      duration: 0,
    },
  },
};
