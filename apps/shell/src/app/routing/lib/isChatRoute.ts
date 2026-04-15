export function isChatRoute(path: string) {
  return path === "/chat" || path.startsWith("/chat/");
}
