/** Drops the room when the venue line already names it as a whole word, like "Convex" in "Convex, 444 De Haro St". */
export function venueLine(where: string, room: string): string {
  const trimmedRoom = room.trim();
  if (trimmedRoom.length === 0) {
    return where;
  }
  const escaped = trimmedRoom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const named = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i");
  return named.test(where) ? where : `${where} · ${trimmedRoom}`;
}
