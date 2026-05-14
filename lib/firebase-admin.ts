import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let app: App;
function getApp(): App {
  if (getApps().length) return getApps()[0]!;
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return app;
}

export async function sendFCM(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  if (!tokens.length) return { successCount: 0 };
  const messaging = getMessaging(getApp());
  return messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
  });
}
