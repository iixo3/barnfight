import ImagePlaceholder from "@/shared/assets/placeholder/image-placeholder/image-placeholder";
import { User } from "@/shared/types/user/user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { Button } from "@/shared/ui/components/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/dialog/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/components/dropdown-menu/dropdown-menu";
import { InputFile } from "@/shared/ui/components/input-file/input-file";
import { Input } from "@/shared/ui/components/input/input";
import Loader from "@/shared/ui/components/loaders/loader";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import BalanceWallet from "../balance-wallet/balance-wallet";
import { useEditProfile } from "./hooks/use-edit-profile";

type ProfileProps = {
  user: User | undefined | null;
  isUserAllowed: boolean;
};

const Profile: React.FC<ProfileProps> = ({ user, isUserAllowed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { disconnect, publicKey } = useWallet();

  const name = useMemo(
    () => user?.username || publicKey?.toString(),
    [user?.username, publicKey]
  );
  const avatar_url = useMemo(() => user?.avatar || "", [user?.avatar]);

  const { onSubmit, nameField, avatarField, reset, isPending } = useEditProfile(
    {
      name,
      closeModal: () => setIsDialogOpen(false),
    }
  );

  const disabledSubmit = useMemo(() => {
    if (avatarField.avatar) {
      return false;
    }

    if (name) {
      if (name.length > 0) {
        return name === nameField.nameValue;
      }
      return true;
    }

    return nameField.nameValue.length === 0;
  }, [name, nameField.nameValue, avatarField.avatar]);

  const handleCreateGame = () => {
    const createGameDialog = document.getElementById("create-game-button");

    if (createGameDialog) {
      setIsDropdownOpen(false);
      createGameDialog.click();
      return;
    }
  };

  const handleTutorialGame = () => {
    const tutorialGameDialog = document.getElementById("tutorial-game-button");

    if (tutorialGameDialog) {
      setIsDropdownOpen(false);
      tutorialGameDialog.click();
      return;
    }
  };

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    setIsDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        defaultOpen={false}
      >
        <DropdownMenuTrigger asChild>
          <Avatar className="w-[44px] h-[44px] cursor-pointer">
            <AvatarImage src={avatar_url} />
            <AvatarFallback>
              <PlaceholderAvatar />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={4} className="w-[200px] mr-6">
          <DropdownMenuGroup>
            <DropdownMenuItem className="block lg:hidden">
              <BalanceWallet />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleTutorialGame}
              className="block lg:hidden"
            >
              Tutorial Game
            </DropdownMenuItem>
            {isUserAllowed && (
              <DropdownMenuItem
                onClick={handleCreateGame}
                className="block lg:hidden"
              >
                Create
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="block lg:hidden">
              <Link href="/games">Discovery</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="block lg:hidden">
              <Link href="/swap">Swap</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditProfile}>
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => disconnect()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isDialogOpen}
        defaultOpen={false}
        onOpenChange={(e) => {
          setIsDialogOpen(e);
          reset();
        }}
      >
        <DialogContent className="sm:max-w-[380px] p-0 border-none bg-transparent shadow-none">
          <DialogDescription className="hidden invisible"></DialogDescription>
          <DialogHeader>
            <DialogTitle asChild>
              <div className="flex items-center gap-x-2">
                <span className="handjet-bold-24 uppercase">MY PROFILE</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col bg-system-modals rounded-2xl px-5 pb-[30px] pt-7 w-full gap-y-9 overflow-hidden">
            <div className="flex flex-col gap-y-8">
              <div className="flex flex-col gap-y-4">
                <span className="handjet-bold-20 text-white">
                  Upload avatar
                </span>

                <div className="flex items-center gap-x-5">
                  <div className="w-20 h-20 rounded-full overflow-hidden relative">
                    {avatarField.avatar ? (
                      <Image
                        src={URL.createObjectURL(avatarField.avatar)}
                        alt="Avatar"
                        fill
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>

                  <div className="flex flex-col gap-y-4 flex-1">
                    <span className="aeonik-light-13 text-text-secondary">
                      100x100px recommended, 5MB max, JPEG or PNG only.
                    </span>

                    <InputFile
                      handleFileChange={avatarField.onChangeAvatar}
                      variant="outline"
                      size="secondary"
                      className="w-fit uppercase"
                      accept="image/jpeg, image/png,.jpeg,.png"
                    >
                      Upload file
                    </InputFile>

                    {avatarField.error && (
                      <span className="handjet-bold-14 text-brand-gradient-red-1">
                        {avatarField.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-y-3">
                <div className="flex flex-col gap-y-1.5">
                  <span className="handjet-bold-20 text-white">Username</span>
                  <span className="aeonik-light-13 text-text-secondary">
                    This is the start of your glorious reputation!
                  </span>
                </div>

                <Input
                  value={nameField.nameValue}
                  onChange={nameField.onChangeNameValue}
                  variant={nameField.error ? "error" : "default"}
                />

                {nameField.error && (
                  <span className="handjet-bold-14 text-brand-gradient-red-1">
                    {nameField.error}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter className="w-full">
              <Button
                disabled={disabledSubmit || isPending}
                type="button"
                variant={"action"}
                onClick={() => (isPending ? null : onSubmit())}
                className="uppercase w-full"
              >
                {isPending ? (
                  <Loader
                    className=" border-black border-t-transparent"
                    size={20}
                  />
                ) : (
                  "finish"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Profile;
