/* =====================================================================
   "ASK THE BUTCHER" · OPTIONAL LIVE AI
   ---------------------------------------------------------------------
   The chat works fully offline with the local knowledge base in
   src/data/knowledge.js. To switch on a live AI model:

   1. Put a SERVER-SIDE proxy in front of your AI provider (never ship a
      secret API key inside front-end code: anyone can read it).
   2. Set `endpoint` to that proxy URL. The site POSTs:
        { system: "...", messages: [{ role: "user"|"assistant", content: "..." }] }
      and accepts any of these reply shapes:
        { reply: "..." }                                   (your own proxy)
        { choices: [{ message: { content: "..." } }] }     (OpenAI-style)
        { content: [{ type: "text", text: "..." }] }       (Messages-style)
   3. Only set `apiKey` if your proxy expects a public, rate-limited key
      in the Authorization header.
   4. Set `enabled: true`.

   If the live call fails for any reason, the chat falls back to the
   local knowledge base automatically.
   ===================================================================== */

export const AI_CONFIG = {
  enabled: false,
  endpoint: '', // e.g. 'https://your-domain.co.za/api/butcher-chat'
  apiKey: '', // leave empty unless your proxy needs a public key
  model: '', // optional, forwarded to your proxy as `model`
  timeoutMs: 15000,
};
