import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import { Button } from "@/shared/ui/components/button/button";
import Icon from "@/shared/ui/components/icon/icon";
import { Input } from "@/shared/ui/components/input/input";
import Loader from "@/shared/ui/components/loaders/loader";
import { cn } from "@/shared/utils";
import React, { useCallback, useState } from "react";
import { useTokenProject } from "../../hooks/use-token-project";
import { validateContractAddress } from "../../lib/create-game-schema";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";

type InputContractProps = {
  handleAppendAdditionalProjectsTokens: (projectTokens: any) => void;
};

const InputContract: React.FC<InputContractProps> = ({
  handleAppendAdditionalProjectsTokens,
}) => {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [errorContractAddress, setErrorContractAddress] = useState<
    string | null
  >(null);

  const {
    handle: handleGetProjectToken,
    clearError: clearErrorProjectToken,
    clearProjectToken,
    isLoading: isLoadingGetProjectToken,
    error: errorProjectToken,
    data: projectToken,
  } = useTokenProject(contractAddress);

  const [cannotCopy, setCannotCopy] = useState(false);

  const handleRightIcon = async () => {
    if (isLoadingGetProjectToken) return;
    if (contractAddress?.length >= 5) {
      handleGetProjectToken();
      return;
    }

    handleCopyClick();
  };

  const handleCopyClick = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text?.length >= 5) {
        setErrorContractAddress(null);
      } else {
        handleValidateContractAddress(text);
        clearErrorProjectToken();
      }

      if (!text) return setCannotCopy(true);

      setContractAddress(text);

      setCannotCopy(false);
    } catch (err) {
      setCannotCopy(true);
    }
  };

  const handleValidateContractAddress = useCallback((text: string) => {
    const { success, error } = validateContractAddress(text);

    if (!success) {
      setErrorContractAddress(error?.errors[0].message);
    } else {
      setErrorContractAddress(null);
      clearErrorProjectToken();
    }
  }, []);

  const handleChangeContractAddress = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(e.target.value);

    if (e.target.value?.length > 0) {
      handleValidateContractAddress(e.target.value);
    } else {
      setErrorContractAddress(null);
      clearErrorProjectToken();
    }
  };

  const approveAdditionalProjectToken = useCallback(() => {
    if (isLoadingGetProjectToken) return;

    handleAppendAdditionalProjectsTokens(projectToken);
    clearProjectToken();
    setContractAddress("");
  }, [handleAppendAdditionalProjectsTokens, projectToken]);

  return (
    <div className="relative flex flex-col gap-y-2">
      {projectToken ? (
        <div
          onClick={approveAdditionalProjectToken}
          className="flex items-center justify-between bg-component-main text-white hover:bg-component-highlight border border-brand-gradient-green-2 h-10 rounded-lg px-[13px] aeonik-light-13"
        >
          <div className="flex items-center gap-x-2">
            <Avatar className="w-[25px] h-[25px]">
              <AvatarImage src={"l"} />
              <AvatarFallback>
                <PlaceholderAvatar />
              </AvatarFallback>
            </Avatar>

            <span>{projectToken?.name}</span>
          </div>

          <Button variant="ghosted" type="button" size="icon_padding">
            <Icon icon="arrow-right" width={20} height={20} />
          </Button>
        </div>
      ) : (
        <Input
          disabled={isLoadingGetProjectToken}
          onChange={handleChangeContractAddress}
          value={contractAddress}
          placeholder="Add contract"
          variant={!!errorContractAddress ? "error" : "default"}
          size="lg"
          rightIcon={
            <Button
              type="button"
              variant="ghosted"
              size="icon_padding"
              className="mt-[4px]"
              onClick={handleRightIcon}
            >
              {isLoadingGetProjectToken ? (
                <Loader size={20} strokeWidth={2} />
              ) : (
                <Icon
                  icon={contractAddress?.length >= 5 ? "arrow-right" : "copy"}
                  width={contractAddress?.length >= 5 ? 20 : 14}
                  height={contractAddress?.length >= 5 ? 20 : 16}
                  className={cn(
                    contractAddress?.length >= 5
                      ? "fill-white"
                      : "fill-icons group-hover:fill-white"
                  )}
                />
              )}
            </Button>
          }
        />
      )}

      {(cannotCopy || !!errorContractAddress || !!errorProjectToken) && (
        <span className="handjet-bold-13 text-brand-gradient-red-1">
          {errorContractAddress ||
            errorProjectToken ||
            "Cannot paste, try again"}
        </span>
      )}
    </div>
  );
};
export default InputContract;
