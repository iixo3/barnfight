//@ts-ignore
import { adminGetDocument } from "@/shared/utils/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { tokenId: string } }
) {
  const tokenData = await adminGetDocument(`tokens/${context.params.tokenId}`, {
    revalidate: 3600 * 24 * 30,
  });
  if (!tokenData) {
    return new NextResponse("Token not found", { status: 404 });
  }
  const nextResponse = new NextResponse(JSON.stringify(tokenData?.fields), {
    status: 200,
  });
  nextResponse.headers.append(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );
  const toReturn = nextResponse.clone();
  return toReturn;
}
