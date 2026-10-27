import admin from "firebase-admin";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";

const upsertGameIndex = async (gameId, gameData) => {
  const firestore = admin.firestore();
  const gameIndexRef = firestore.collection("game_index").doc(gameId);
  let tokens = (gameData.tokens || []).map((tokenDocData) => ({
    token_address: tokenDocData.token_address,
    name: "NAME",
    symbol: "SYMBOL",
  }));
  if (tokens.length > 0) {
    const tokensQuery = firestore.collection("tokens").where(
      "address",
      "in",
      tokens.map((token) => token.token_address)
    );
    const tokenDocs = await tokensQuery.get();
    tokens.map((token, index) => {
      const tokenDoc = tokenDocs.docs.find(
        (doc) => doc.data().address === token.token_address
      );
      if (tokenDoc) {
        const tokenDocData = tokenDoc.data();
        tokens[index] = {
          token_address: tokenDocData?.address,
          name: tokenDocData?.name || "NAME",
          symbol: tokenDocData?.symbol || "SYMBOL",
        };
      }
    });
  }

  await gameIndexRef.set(
    {
      name: gameData.name,
      creator: gameData.creator,
      end_date: gameData.end_date,
      id: gameId,
      streamers: gameData?.streamers?.length || 0,
      tokens: tokens || [],
      is_ended: gameData.is_ended || false,
      total_reward: gameData.total_reward || 0,
    },
    { merge: true }
  );
};
export const onGameCreated = onDocumentCreated(
  "game/{gameId}",
  async (event) => {
    const game = event.data;
    const gameId = event.params.gameId;
    const gameData = game.data();
    await upsertGameIndex(gameId, gameData);
  }
);

export const onGameDeleted = onDocumentDeleted(
  "game/{gameId}",
  async (event) => {
    const gameId = event.params.gameId;
    const firestore = admin.firestore();
    const gameIndexRef = firestore.collection("game_index").doc(gameId);
    await gameIndexRef.delete();
  }
);

export const onGameUpdated = onDocumentUpdated(
  "game/{gameId}",
  async (event) => {
    const game = event.data;
    const gameId = event.params.gameId;
    if (game.after.exists) {
      const gameData = game.after.data();
      await upsertGameIndex(gameId, gameData);
    }
  }
);
