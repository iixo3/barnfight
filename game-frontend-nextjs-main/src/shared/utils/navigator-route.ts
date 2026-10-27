type NavigatorRouteResponse = "public" | "private";

export const navigatorRoute = (path: string): NavigatorRouteResponse => {
  const isPrivate = path.split("/").includes("room");

  return isPrivate ? "private" : "public";
};
