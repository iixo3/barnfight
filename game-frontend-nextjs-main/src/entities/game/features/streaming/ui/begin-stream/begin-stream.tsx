"use client";
import { Button } from "@/shared/ui/components/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/components/dialog/dialog";
import { Input } from "@/shared/ui/components/input/input";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { httpsCallable } from "@firebase/functions";
import { useParams } from "next/navigation";
import { functions } from "@/shared/utils/firebase";
import Loader from "@/shared/ui/components/loaders/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select/select";
import { cookies } from "next/headers";

type BeginStreamProps = {};

const schemaUsername = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .min(4, { message: "Min length is 4 characters" })
    .max(25, { message: "Max length is 25 characters" }),
});

const BeginStream: React.FC<BeginStreamProps> = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [platform, setPlatform] = useState<string>("twitch");
  const [errorUsername, setErrorUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();
  const gameId = `${params.gameId}`;

  const handleSubmit = async () => {
    const requestGameStreamRequest = httpsCallable(
      functions,
      "game-requestGameStream"
    );
    const { success, error } = schemaUsername.safeParse({
      username,
    });

    if (!success && error) {
      const errorParsed = (JSON.parse(error.message) as Array<any>)[0]?.message;
      setErrorUsername(errorParsed);

      return;
    }

    try {
      setLoading(true);

      const response = (await requestGameStreamRequest({
        gameId,
        streamer_username: username,
        platform: platform,
      })) as { data: { status: string; message: string } };

      if (!response.data || response.data.status !== "success") {
        if (response.data.status === "error") {
          setErrorUsername(response.data.message);
          setLoading(false);
          return;
        } else {
          setErrorUsername(
            "We couldn't start the stream. Please try again later."
          );
          setLoading(false);
          return;
        }
      }

      if (response.data.status === "success") {
        reset();
        setOpen(false);
        setLoading(false);
      }
    } catch (error) {
      setErrorUsername("We couldn't start the stream. Please try again later.");
      setLoading(false);
    }
  };

  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    const { success, error } = schemaUsername.safeParse({
      username: value,
    });

    if (success) {
      setErrorUsername("");
      return;
    }

    const errorParsed = (JSON.parse(error.message) as Array<any>)[0]?.message;

    setErrorUsername(errorParsed);
  };

  const disabledSubmit = useMemo(() => {
    return !!errorUsername || username.length < 4;
  }, [errorUsername, username]);

  function reset() {
    setUsername("");
    setErrorUsername("");
    setPlatform("twitch");
  }

  return (
    <Dialog
      defaultOpen={open}
      onOpenChange={(e) => {
        reset();
        setOpen(e);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="link_ghosted"
          className="uppercase handjet-bold-13"
        >
          Begin +
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px] p-0 border-none bg-transparent shadow-none">
        <DialogDescription className="hidden invisible"></DialogDescription>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-x-2">
              <span className="handjet-bold-24 uppercase">Begin stream</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col bg-system-modals rounded-2xl px-5 pb-[30px] pt-7 w-full gap-y-9 overflow-hidden">
          <div className="flex flex-col gap-y-3">
            <div className="flex flex-col gap-y-1.5">
              <span className="handjet-bold-20 text-white">
                Streamer username
              </span>
              <span className="aeonik-light-13 text-text-secondary">
                Enter either your twitch username or youtube link id to start
                streaming.
              </span>
            </div>

            <div className="flex items-center gap-x-3">
              <div className="flex-1">
                <Input
                  className="flex-1"
                  value={username}
                  onChange={handleChangeUsername}
                  variant={errorUsername ? "error" : "default"}
                />
              </div>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="max-w-[80px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="youtube">Youtube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorUsername && (
              <span className="handjet-bold-14 text-brand-gradient-red-1">
                {errorUsername}
              </span>
            )}
          </div>

          <DialogFooter className="w-full">
            <Button
              disabled={disabledSubmit || loading}
              type="button"
              onClick={loading ? () => {} : handleSubmit}
              variant={"action"}
              className="uppercase w-full"
            >
              {loading ? (
                <Loader
                  className=" border-black border-t-transparent"
                  size={20}
                />
              ) : (
                "STREAM NOW"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default BeginStream;
