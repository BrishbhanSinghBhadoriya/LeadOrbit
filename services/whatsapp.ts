// TODO: WhatsApp Business Cloud API stub.
// Set WABA_TOKEN, WABA_PHONE_NUMBER_ID env vars.
const API = "https://graph.facebook.com/v20.0";

export async function sendTemplate(to: string, template: string, lang = "en_US") {
  const res = await fetch(`${API}/${process.env.WABA_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WABA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: template, language: { code: lang } },
    }),
  });
  if (!res.ok) throw new Error(`WABA error: ${res.status}`);
  return res.json();
}
