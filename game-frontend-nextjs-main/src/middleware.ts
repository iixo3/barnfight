import { NextRequest, NextResponse } from "next/server";
import { navigatorRoute } from "./shared/utils/navigator-route";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === "/") {
    return NextResponse.redirect(new URL("/games/popular", req.nextUrl));
  }

  if (path.split("/").includes("games")) {
    const games_paths = ["popular", "history", "hosted"];

    const sub_path = path.split("/")[2];

    if (!sub_path || !games_paths.includes(sub_path)) {
      return NextResponse.redirect(new URL("/games/popular", req.nextUrl));
    }

    const response = NextResponse.next();
    return response;
  }

  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
