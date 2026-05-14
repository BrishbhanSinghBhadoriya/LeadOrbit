// Custom Node server enabling Socket.IO alongside Next.js.
// Run with: tsx server.ts (or compile and run with node).
// Note: For Vercel deployment, replace Socket.IO with Pusher/Ably or Vercel WebSocket support.
import { createServer } from "node:http";
import next from "next";
import { Server as IOServer } from "socket.io";
import { jwtVerify } from "jose";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const app = next({ dev });
const handle = app.getRequestHandler();
const encoder = new TextEncoder();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new IOServer(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("unauthorized"));
      const { payload } = await jwtVerify(token, encoder.encode(process.env.JWT_ACCESS_SECRET!));
      (socket.data as { user: unknown }).user = payload;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join("leads");
    const user = (socket.data as { user: { sub: string } }).user;
    if (user?.sub) socket.join(`user:${user.sub}`);

    socket.on("disconnect", () => {});
  });

  // Expose globally for emitToRoom helper
  (global as unknown as { __io: IOServer }).__io = io;

  httpServer.listen(port, () => console.log(`> ready on http://localhost:${port}`));
});
