import admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

const requestGameStream = onCall(async (event) => {
  const streamer_username_data = event.data.streamer_username;
  const platform = event.data.platform;
  const gameId = event.data.gameId;

  if (!streamer_username_data || !platform || !gameId) {
    throw new Error("Missing parameters");
  }

  const streamer_username =
    platform === "twitch"
      ? streamer_username_data.toLowerCase()
      : streamer_username_data;

  const gameSnapshot = await admin
    .firestore()
    .collection("game")
    .doc(gameId)
    .get();

  //check if twitch is online
  try {
    if (!gameSnapshot.exists) {
      throw new Error("Game not found");
    }
    const gameData = gameSnapshot.data();

    if (gameData?.streamers?.length === 4) {
      throw new Error("Game is full");
    }

    const findStreamerAlready = gameData?.streamers?.find(
      (streamer) => streamer.username === streamer_username
    );
    if (findStreamerAlready) {
      throw new Error("Streamer is already streaming in this game");
    }
    // if (gameData?.streamers?.includes(twitch)) {
    //     throw new Error("Streamer is already streaming in this game");
    // }

    if (gameData?.private_stream) {
      throw new Error("Game is private");
    }

    const platform_url =
      platform === "twitch"
        ? `https://barnfight.vercel.app/api/twitch/channel?username=${streamer_username}`
        : `https://barnfight.vercel.app/api/youtube/channel?videoID=${streamer_username}`;

    const response = await fetch(platform_url);

    if (!response.ok) {
      throw new Error("Could not get streamer, try again later");
    }

    const data = await response.json();

    const isStreamerLive =
      platform === "twitch" ? data.user_login : data.is_live;

    if (!data || !isStreamerLive) {
      throw new Error(
        `${platform === "twitch" ? "Twitch" : "Youtube"} streamer is offline`
      );
    }

    // const existingStream = await admin
    //   .firestore()
    //   .collection("game")
    //   .where("streamers", "array-contains", twitch)
    //   .get();

    const existingStream = await admin
      .firestore()
      .collection("game")
      .where("streamers", "array-contains", {
        streamer: streamer_username,
        platform: platform,
      })
      .get();

    if (existingStream.size > 0) {
      throw new Error("Streamer is already streaming in another game");
    }
  } catch (e) {
    return {
      status: "error",
      message: e.message,
    };
  }

  await admin
    .firestore()
    .collection("game")
    .doc(gameId)
    .update(
      {
        streamers: admin.firestore.FieldValue.arrayUnion({
          streamer: streamer_username,
          platform: platform,
        }),
      },
      { merge: true }
    );
  return {
    status: "success",
  };
});
export default requestGameStream;
