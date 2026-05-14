// TODO: Twilio Programmable Voice integration.
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM env vars.
import twilio from "twilio";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;

export const twilioClient = sid && token ? twilio(sid, token) : null;

export async function clickToCall(toE164: string, agentE164: string) {
  if (!twilioClient) throw new Error("Twilio not configured");
  return twilioClient.calls.create({
    to: toE164,
    from: process.env.TWILIO_FROM!,
    twiml: `<Response><Dial>${agentE164}</Dial></Response>`,
    record: true,
  });
}
