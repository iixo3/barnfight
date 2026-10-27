import { useWallet } from "@solana/wallet-adapter-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { httpsCallable } from "@firebase/functions";
import { z } from "zod";
import { functions } from "@/shared/utils/firebase";
import { useAnchorProvider } from "@/shared/providers/solana-provider";
import { useMemetankProgram } from "@/contract/memetank-data-access";
import { PublicKey } from "@solana/web3.js";
import { encode } from "bs58";
import { getQueryClient } from "@/shared/utils/get-query-client";
import { User } from "@/shared/types/user/user";

interface UseEditProfileProps {
  name?: string;
  closeModal?: () => void;
}

interface UseEditProfileReturn {
  onSubmit: () => void;
  isPending: boolean;
  reset: () => void;
  nameField: {
    nameValue: string;
    onChangeNameValue: (e: ChangeEvent<HTMLInputElement>) => void;
    error: string | null;
  };
  avatarField: {
    avatar: File | null;
    onChangeAvatar: (e: ChangeEvent<HTMLInputElement>) => void;
    error: string | null;
  };
}

export const useEditProfile = ({
  name = "",
  closeModal,
}: UseEditProfileProps = {}): UseEditProfileReturn => {
  const editProfileSchema = z.object({
    name: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (value && value.length > 0) {
            return value.length >= 1;
          }
          return true;
        },
        {
          message: "Name must be at least 3 characters long",
        }
      ),
    avatar: z
      .instanceof(File)
      .optional()
      .refine((file) => {
        if (file) {
          const validTypes = ["image/jpeg", "image/png"];
          return validTypes.includes(file.type);
        }
        return true;
      }, "File must be .png or .jpeg")
      .refine((file) => {
        if (file) {
          return file.size <= 5 * 1024 * 1024;
        }
        return true;
      }, "File size must not exceed 5MB"),
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [errorAvatar, setErrorAvatar] = useState<string | null>(null);

  const [nameValue, setNameValue] = useState<string>(name);
  const [errorName, setErrorName] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  const { getMemeTankUserPDA } = useMemetankProgram();

  const { publicKey, disconnect, signMessage, connected } = useWallet();

  const onSubmitedSetQueryData = useCallback(() => {
    console.log("onSubmited");

    const queryClient = getQueryClient();
    const pk = publicKey?.toString();

    queryClient.setQueryData(["users", pk], (data: User) => {
      return {
        ...data,
        username: nameValue,
      };
    });
  }, [publicKey, publicKey?.toString(), getQueryClient, nameValue]);

  const onSubmit = async () => {
    setIsPending(true);
    const saveProfile = httpsCallable(functions, "user-onChangeProfileData");

    const hasNameChanged = nameValue.length > 0 && name !== nameValue;
    const hasAvatar = !!avatar;

    const persistData = async (data: any) => {
      if (signMessage && publicKey) {
        const avatarBase64 = avatar
          ? await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(avatar);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
            })
          : null;

        const avatarHash = avatarBase64
          ? await crypto.subtle
              .digest("SHA-256", new TextEncoder().encode(avatarBase64))
              .then((hashBuffer) => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray
                  .map((byte) => byte.toString(16).padStart(2, "0"))
                  .join("");
              })
          : null;

        const payload = JSON.stringify({
          ...data,
          avatarHash: avatarHash?.toString(),
          userPDA: await getMemeTankUserPDA(publicKey),
          publicKey: publicKey.toString(),
        });

        const message = new TextEncoder().encode(payload);

        const signature = await signMessage(message);

        // TODO: errors ????
        await saveProfile({
          payload,
          signature: encode(signature),
          avatarBase64,
        })
          .then((res) => {
            onSubmitedSetQueryData();
          })
          .catch((err) => console.log("rex-error", err))
          .finally(() => {
            closeModal?.();
            setIsPending(false);
            reset();
          });
      }
    };

    if (hasAvatar && !hasNameChanged) {
      const { success, error } = editProfileSchema.safeParse({ avatar });

      if (!success && error) {
        const errorParsed = (JSON.parse(error.message) as Array<any>).filter(
          (err) => err.path.includes("avatar")
        );
        setErrorAvatar(errorParsed?.[0]?.message);
        return;
      }
      await persistData({ avatar });
      console.log("edit profile with avatar", { avatar });
      return;
    }

    if (hasNameChanged && !hasAvatar) {
      const { success, error } = editProfileSchema.safeParse({
        name: nameValue,
      });

      if (!success && error) {
        const errorParsed = (JSON.parse(error.message) as Array<any>).filter(
          (err) => err.path.includes("name")
        );
        setErrorName(errorParsed?.[0]?.message);
        return;
      }
      await persistData({ username: nameValue });
      console.log("edit profile with name", { name: nameValue });
      return;
    }

    if (hasNameChanged && hasAvatar) {
      const { success, error } = editProfileSchema.safeParse({
        name: nameValue,
        avatar,
      });

      if (!success && error) {
        const errorParsed = JSON.parse(error.message) as Array<any>;
        const nameErrors = errorParsed.filter((err) =>
          err.path.includes("name")
        );
        const avatarErrors = errorParsed.filter((err) =>
          err.path.includes("avatar")
        );

        if (nameErrors.length) setErrorName(nameErrors[0].message);
        if (avatarErrors.length) setErrorAvatar(avatarErrors[0].message);
        return;
      }

      await persistData({ username: nameValue, avatar });

      console.log("edit profile with name and avatar", {
        username: nameValue,
        avatar,
      });
      return;
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameValue(value);

    const { success, error } = editProfileSchema.safeParse({
      name: value,
    });

    if (success) {
      setErrorName("");
      return;
    }

    const errorParsed = (JSON.parse(error.message) as Array<any>).filter(
      (err) => err.path.includes("name")
    );

    setErrorName(errorParsed?.[0]?.message);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorAvatar("");

    if (!file) {
      setAvatar(null);
      return;
    }

    setAvatar(file);

    const { success, error } = editProfileSchema.safeParse({
      avatar: file,
    });

    if (success) {
      setErrorAvatar("");
      return;
    }

    const errorParsed = (JSON.parse(error.message) as Array<any>).filter(
      (err) => err.path.includes("avatar")
    );

    setErrorAvatar(errorParsed?.[0]?.message);
  };

  const reset = useCallback(() => {
    setNameValue(name ?? "");
    setErrorName("");
    setAvatar(null);
    setErrorAvatar("");
  }, [name]);

  useEffect(() => {
    setNameValue(name ?? "");
  }, [name]);

  return {
    reset,
    onSubmit,
    isPending,
    nameField: {
      error: errorName,
      nameValue,
      onChangeNameValue: handleNameChange,
    },
    avatarField: {
      error: errorAvatar,
      avatar,
      onChangeAvatar: handleAvatarChange,
    },
  };
};
