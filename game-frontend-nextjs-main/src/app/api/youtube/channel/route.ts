import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function get_live_info(videoID: string) {
  const url_info = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoID}&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url_info).then((res) => res.json());

  if (!response.items[0] || !response.items[0].snippet) {
    return false;
  }

  const get_channel_id = response?.items[0]?.snippet?.channelId;

  let channel_profile_url = "";
  if (get_channel_id) {
    const on_get_profile = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${get_channel_id}&fields=items%2Fsnippet%2Fthumbnails&key=${YOUTUBE_API_KEY}`
    ).then((res) => res.json());

    channel_profile_url =
      on_get_profile?.items[0]?.snippet?.thumbnails?.default?.url || "";
  }

  const get_live_ino = {
    channel_name: response?.items?.[0]?.snippet?.channelTitle || videoID || "",
    views: response?.items?.[0]?.liveStreamingDetails?.concurrentViewers || 0,
    is_live: response?.items?.[0]?.snippet?.liveBroadcastContent === "live",
    channel_profile_url: channel_profile_url || "",
  };

  return get_live_ino;
}

async function handleRequest(event: NextRequest) {
  try {
    const { searchParams } = new URL(event.url);
    const videoID = searchParams.get("videoID");

    if (!videoID) {
      return NextResponse.json(
        { error: "Missing videoID parameter" },
        { status: 400 }
      );
    }

    const liveStreamInfo = await get_live_info(videoID);

    return NextResponse.json({ ...liveStreamInfo }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong x_x" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const nextResponse = await handleRequest(request);
  const toReturn = nextResponse.clone();
  nextResponse.headers.append("Cache-Control", "public, max-age=60");
  return toReturn;
}
