//@ts-ignore
import { adminGetDocument } from "@/shared/utils/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { tokenId: string } }
) {
  // Do whatever you want
  const tokenData = await adminGetDocument(`tokens/${context.params.tokenId}`, {
    revalidate: 3600 * 24 * 30,
  });
  if (!tokenData) {
    return new NextResponse("Token not found", { status: 404 });
  }
  const imageURI = tokenData.fields.logoURI;
  const imageResponse = await fetch(imageURI, {
    next: {
      revalidate: 3600 * 24 * 30, // 1 hour
    },
  });
  const imageBlob = await imageResponse.blob();
  const nextResponse = new NextResponse(imageBlob, { status: 200 });
  nextResponse.headers.append(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );
  nextResponse.headers.append(
    "Content-Type",
    imageResponse.headers.get("Content-Type") || "image/png"
  );
  const toReturn = nextResponse.clone();
  return toReturn;
}
