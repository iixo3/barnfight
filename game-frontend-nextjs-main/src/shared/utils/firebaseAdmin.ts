import { FetchFn } from "@solana/web3.js";
import { getJWTFromServiceAccount } from "./get-jwt";
import FireStoreParser from "./firestoreParser";
import { formatGamesWinners } from "./format-games-winners";

export const firebase_admin_config = (() => {
  try {
    return JSON.parse(process.env.FIREBASE_ADMIN_PRIVATE_KEY || "");
  } catch (error) {
    console.log("error", error);
    return null;
  }
})();

export const adminGetDocument = async (
  path: string,
  fetchProps: NextFetchRequestConfig
) => {
  const accessToken = await getJWTFromServiceAccount(firebase_admin_config, {
    aud: "https://firestore.googleapis.com/google.firestore.v1.Firestore",
  });

  const endpoint_db =
    process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet"
      ? `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID_DEV}`
      : `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}`;

  const data = await fetch(
    `${endpoint_db}/databases/(default)/documents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: fetchProps,
    }
  )
    .then((res) => res.json())
    .then((res) => FireStoreParser(res));

  if (data?.error) {
    return null;
  } else {
    return data;
  }
};

export const getGamesPopular = async () => {
  const accessToken = await getJWTFromServiceAccount(firebase_admin_config, {
    aud: "https://firestore.googleapis.com/google.firestore.v1.Firestore",
  });

  const endpoint_db =
    process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet"
      ? `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID_DEV}`
      : `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}`;

  const data = await fetch(
    `${endpoint_db}/databases/(default)/documents/game`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => FireStoreParser(res));

  if (data?.error) {
    return null;
  }

  if (Array.isArray(data.documents) && data.documents.length > 0) {
    return data.documents.map((ite: any) => ({ ...ite.fields }));
  }

  return null;

  // popular by: pool , views ?
  //   const data = await fetch(
  //     `https://firestore.googleapis.com/v1/projects/<project-id>/databases/(default)/documents:runQuery`,
  //     {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify({
  //         structuredQuery: {
  //           from: [{ collectionId: collectionPath }],
  //           where: {
  //             fieldFilter: {
  //               field: { fieldPath: "id" },
  //               op: "EQUAL",
  //               value: {
  //                 stringValue: "<id>",
  //               },
  //             },
  //           },
  //         },
  //       }),
  //     }
  //   )
  //     .then((res) => res.json())
  //     .then((res) => FireStoreParser(res));
};
