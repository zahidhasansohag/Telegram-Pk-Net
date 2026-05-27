import { RouterOSAPI } from 'node-routeros';

export default async function handler(req, res) {
  // আপনার বটের টোকেন সরাসরি দিয়ে দিলাম, যেন আর কখনো না হারায়!
  const TELEGRAM_TOKEN = "8866966440:AAEtCyfJs1mjT9bTB_AVNbi9M6-UQrNK7tA";
  const ADMIN_ID = 6855051736;

  const body = req.body || {};
  const text = body.message?.text || "";
  const chatId = body.message?.chat?.id;

  const isPing = req.method === 'GET';
  const isStatusCmd = req.method === 'POST' && text === '/status' && chatId === ADMIN_ID;

  // ১. লাইভ রিপোর্ট সেকশন
  if (isPing || isStatusCmd) {
    let targetChatId = isPing ? ADMIN_ID : chatId;
    try {
      const api = new RouterOSAPI({
        host: 'remote.cloudmikrotik.online',
        port: 10102,
        user: 'user',
        password: '0000'
      });
      await api.connect();

      const activeUsers = await api.write('/ip/hotspot/active/print');
      const userCount = activeUsers.length;
      const userNames = activeUsers.slice(0, 5).map(u => u.user).join(', ');

      const resource = await api.write('/system/resource/print');
      const cpu = resource[0]['cpu-load'];
      const uptime = resource[0]['uptime'];

      api.close();

      const replyMessage = `📊 *PK NET Live Report*\n\n👥 মোট ইউজার: ${userCount} জন\n👤 প্রথম ৫ জন: ${userNames}\n🌡️ CPU লোড: ${cpu}%\n⏱️ আপটাইম: ${uptime}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: targetChatId, text: replyMessage })
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      if (isStatusCmd) {
         await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: targetChatId, text: "❌ মিক্রোটিকের সাথে কানেক্ট করা যাচ্ছে না। API পোর্ট ঠিক আছে কি না চেক করুন।" })
        });
      }
      return res.status(500).json({ error: "Connection Failed" });
    }
  }

  // ২. সাধারণ কমান্ড সেকশন
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

  return res.status(200).json({ status: "Bot is running!" });
}
