import { useState } from "react";

interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  on: () => void;
  off: () => void;
  setValue: (prev: boolean) => void;
}

interface UseToggleParams {
  defaultValue?: boolean;
}

export const useToggle = ({
  defaultValue = false,
}: UseToggleParams = {}): UseToggleReturn => {
  const [value, setValue] = useState(defaultValue);

  const toggle = () => setValue((prev) => !prev);

  const on = () => setValue(true);

  const off = () => setValue(false);

  return { value, setValue, toggle, on, off };
};
