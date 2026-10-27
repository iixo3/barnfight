import admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { PublicKey } from "@solana/web3.js";
import crypto from "crypto";
import nacl from "tweetnacl";
import tutils from "tweetnacl-util";
import bs58 from "bs58";

const setGameSettings = onCall(async (event) => {
  const messageJson = event.data.payload;
  const signature = event.data.signature;
  const message = JSON.parse(messageJson);
  const streamers = message.streamers;
  const private_stream = message.private_stream;

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
    if (!message.gameId) {
      throw new Error("Invalid gameId");
    }
    const gameSnapshot = await admin
      .firestore()
      .collection("game")
      .doc(message.gameId)
      .get();

    const gameData = gameSnapshot.data();

    if (gameData.creator !== message.publicKey) {
      throw new Error("Invalid creator");
    }
    // const [userPda] = await PublicKey.findProgramAddress(
    //     [Buffer.from('user'), wallet.toBuffer()],
    //     programId
    // );
    // if (message.userPDA !== userPda.toString()) {
    //     throw new Error("Invalid userPDA");
    // }

    if (!Array.isArray(streamers)) {
      throw new Error("Invalid streamers");
    }
    //check if all streamers are text strings
    for (let i = 0; i < streamers.length; i++) {
      const { streamer, platform } = streamers[i];
      if (
        typeof streamer !== "string" ||
        typeof platform !== "string" ||
        (platform !== "twitch" && platform !== "youtube")
      ) {
        throw new Error("Invalid streamer");
      }
    }
    // for (let i = 0; i < streamers.length; i++) {
    //     if (typeof streamers[i] !== 'string') {
    //         throw new Error("Invalid streamer");
    //     }
    // }

    if (streamers.length > 4) {
      throw new Error("Too many streamers");
    }
    let dataToSave = {
      streamers,
      private_stream,
    };

    await admin
      .firestore()
      .collection("game")
      .doc(message.gameId)
      .set(dataToSave, {
        merge: true,
      });
    return {
      status: "success",
      message: "Game settings updated",
      ...dataToSave,
    };
  } catch (e) {
    return {
      status: "error",
      message: e.message,
    };
  }
});
export default setGameSettings;
