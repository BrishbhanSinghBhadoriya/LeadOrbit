import type { Server as IOServer } from "socket.io";

export function emitToRoom(room: string, event: string, payload: unknown) {
  const io = (global as unknown as { __io?: IOServer }).__io;
  if (!io) return; // serverless deploy without custom server
  io.to(room).emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  emitToRoom(`user:${userId}`, event, payload);
}
