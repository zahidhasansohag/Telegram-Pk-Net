import { RouterOSAPI } from 'node-routeros';

export default async function handler(req, res) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_ID = 6855051736;

  const body = req.body || {};
  const text = body.message?.text || "";
  const chatId = body.message?.chat?.id;

  const isPing = req.method === 'GET';
  const isStatusCmd = req.method === 'POST' && text === '/status' && chatId === ADMIN_ID;

  // ১. লাইভ রিপোর্ট সেকশন (Ping অথবা /status কমান্ড)
  if (isPing || isStatusCmd) {
    let targetChatId = isPing ? ADMIN_ID : chatId;

    try {
      // মিক্রোটিকের সাথে API কানেকশন
      const api = new RouterOSAPI({
        host: 'remote.cloudmikrotik.online',
        port: 10102,
        user: 'user',
        password: '0000'
      });

      await api.connect();

      // অ্যাক্টিভ ইউজার এবং সিপিইউ ডেটা টানা
      const activeUsers = await api.write('/ip/hotspot/active/print');
      const userCount = activeUsers.length;

      const resource = await api.write('/system/resource/print');
      const cpu = resource[0]['cpu-load'];
      const uptime = resource[0]['uptime'];

      api.close();

      const replyMessage = `📊 *PK NET Live Report*\n\n👥 অ্যাক্টিভ ইউজার: ${userCount} জন\n🌡️ CPU লোড: ${cpu}%\n⏱️ আপটাইম: ${uptime}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: targetChatId, text: replyMessage })
      });

      return res.status(200).json({ ok: true, message: "Report sent!" });

    } catch (error) {
      console.error("Mikrotik API Error:", error);
      if (isStatusCmd) {
         await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: targetChatId, text: "❌ মিক্রোটিকের সাথে কানেক্ট করা যাচ্ছে না। VPN লাইন ঠিক আছে কি না চেক করুন।" })
        });
      }
      return res.status(500).json({ error: "Connection Failed" });
    }
  }

  // ২. সাধারণ কমান্ড সেকশন (/start, /packages)
  if (req.method === 'POST' && chatId) {
    if (text === '/status') return res.status(200).json({ ok: true });

    let reply = "দুঃখিত, আমি কমান্ডটি বুঝতে পারিনি। মেনু দেখতে /start চাপুন।";

    if (text === '/start') {
      reply = "স্বাগতম PK NET-এ! 🌐\nকীভাবে সাহায্য করতে পারি?\n\nপ্যাকেজ দেখতে /packages লিখুন\nলাইভ অবস্থা দেখতে /status লিখুন";
    } else if (text === '/packages') {
      reply = "📦 আমাদের প্যাকেজসমূহ:\n১. ১ দিন - ১৫ টাকা\n২. ৭ দিন - ৭০ টাকা\n৩. ৩০ দিন - ২৫০ টাকা";
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
