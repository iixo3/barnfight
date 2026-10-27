import { NextResponse, NextRequest } from "next/server";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_SECRET;

async function getTwitchToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

  const response = await fetch(url, {
    method: "POST",
    next: { revalidate: 60 },
  });

  if (response.ok) {
    const tokenData = await response.json();
    return tokenData.access_token; // Return the access token
  } else {
    return null;
  }
}

async function getTwitchStreamData(username: string, accessToken: string) {
  const url = `https://api.twitch.tv/helix/streams?user_login=${username}`;

  if (!TWITCH_CLIENT_ID) {
    throw new Error("TWITCH_CLIENT_ID is not defined");
  }

  const headers = {
    "Client-ID": TWITCH_CLIENT_ID,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, { headers, next: { revalidate: 60 } });

  if (response.ok) {
    const data = await response.json();
    return data.data.length > 0 ? data.data[0] : null; // Returns the stream if live
  } else {
    return { error: "Unable to fetch stream data from Twitch" };
  }
}

async function handleRequest(event: NextRequest) {
  const { searchParams } = new URL(event.url);
  const username = searchParams.get("username");

  if (!username) {
    return new Response("Missing username parameter", { status: 400 });
  }

  // Fetch OAuth token
  const accessToken = await getTwitchToken();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unable to get access token from Twitch" },
      { status: 500 }
    );
  }

  // Fetch Twitch stream data
  const streamData = await getTwitchStreamData(username, accessToken);

  if (streamData) {
    return NextResponse.json(
      {
        user_name: streamData.user_name,
        user_login: streamData?.user_login,
        viewer_count: streamData?.viewer_count,
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ error: "Streamer offline" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const nextResponse = await handleRequest(request);
  const toReturn = nextResponse.clone();
  nextResponse.headers.append("Cache-Control", "public, max-age=60");
  return toReturn;
}
