/** Drops the room when the venue line already names it, like "Convex" in "Convex, 444 De Haro St". */
export function venueLine(where: string, room: string): string {
  const trimmedRoom = room.trim();
  if (
    trimmedRoom.length === 0 ||
    where.toLowerCase().includes(trimmedRoom.toLowerCase())
  ) {
    return where;
  }
  return `${where} · ${trimmedRoom}`;
}
