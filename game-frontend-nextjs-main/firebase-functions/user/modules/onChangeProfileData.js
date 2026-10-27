import admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { PublicKey } from "@solana/web3.js";
import crypto from "crypto";
import nacl from "tweetnacl";
import tutils from "tweetnacl-util";
import bs58 from "bs58";

const onChangeProfileData = onCall(async (event) => {
  const messageJson = event.data.payload;
  const signature = event.data.signature;
  const message = JSON.parse(messageJson);
  const username = message.username;
  const programId = new PublicKey(
    "PROGRAM_ID_REMOVED"
  );

  try {
    const wallet = new PublicKey(message.publicKey);

    const result = nacl.sign.detached.verify(
      tutils.decodeUTF8(messageJson),
      bs58.decode(signature),
      wallet.toBytes()
    );

    if (!result) {
      throw new Error("Invalid signature");
    }
    // const [userPda] = await PublicKey.findProgramAddress(
    //     [Buffer.from('user'), wallet.toBuffer()],
    //     programId
    // );
    // if (message.userPDA !== userPda.toString()) {
    //     throw new Error("Invalid userPDA");
    // }

    let dataToSave = {
      // username,
      user_pubkey: message.publicKey,
    };

    if (username) {
      if (!username || username.lengh < 3) {
        throw new Error("Username must be at least 3 characters long");
      }
      const existingUser = await admin
        .firestore()
        .collection("users")
        .where("username", "==", username)
        .get();
      if (existingUser.size > 0) {
        if (existingUser.docs[0].id !== message.publicKey) {
          throw new Error("Username already exists");
        }
      }
      dataToSave.username = username;
    }

    if (message.avatarHash) {
      const avatarBase64 = event.data.avatarBase64;
      const hash = crypto
        .createHash("sha256")
        .update(avatarBase64)
        .digest("hex");
      if (hash !== message.avatarHash) {
        throw new Error("Invalid avatar hash");
      }

      // Validate and detect content type
      const matches = avatarBase64.match(
        /^data:(image\/(png|jpeg|jpg));base64,/
      );
      if (!matches) {
        throw new Error("Invalid image format. Only PNG and JPEG are allowed.");
      }
      const contentType = matches[1];
      //data:image/jpeg;base64,
      const base64Data = avatarBase64.replace(
        /^data:image\/(png|jpeg|jpg);base64,/,
        ""
      );

      const avatarRef = admin
        .storage()
        .bucket()
        .file(`avatars/${message.userPDA}.${contentType.split("/")[1]}`);
      // Add public read ACL
      await avatarRef.save(Buffer.from(base64Data, "base64"), {
        contentType: contentType,
        resumable: false,
      });
      await avatarRef.makePublic();
      //get url
      const avatar = avatarRef.publicUrl();
      dataToSave.avatar = avatar;
    }
    await admin
      .firestore()
      .collection("users")
      .doc(message.publicKey)
      .set(dataToSave, {
        merge: true,
      });
  } catch (e) {
    return {
      status: "error",
      message: e.message,
    };
  }
});
export default onChangeProfileData;
