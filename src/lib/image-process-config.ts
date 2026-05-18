/** Max longest edge after server-side crop. */
export function maxEdgeForAspect(aspect: number): number {
  return aspect >= 1 ? 1920 : 1200;
}
