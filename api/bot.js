import { RouterOSAPI } from 'node-routeros';

export default async function handler(req, res) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  const body = req.body || {};
  const text = body.message?.text || "";
  const chatId = body.message?.chat?.id;

  // কেউ কোনো টেক্সট না পাঠালে ইগনোর করবে
  if (!chatId) return res.status(200).json({ status: "OK" });

  // ১. /start কমান্ড
  if (text === '/start') {
    const reply = "স্বাগতম PK NET-এ! 🌐\nকীভাবে সাহায্য করতে পারি?\n\nপ্যাকেজ দেখতে /packages লিখুন\nলাইভ অবস্থা দেখতে /status লিখুন";
    await sendMessage(chatId, reply, TELEGRAM_TOKEN);
    return res.status(200).json({ ok: true });
  } 
  
  // ২. /packages কমান্ড
  if (text === '/packages') {
    const reply = "📦 আমাদের প্যাকেজসমূহ:\n১. ১ দিন - ১৫ টাকা\n২. ৭ দিন - ৭০ টাকা\n৩. ৩০ দিন - ২৫০ টাকা";
    await sendMessage(chatId, reply, TELEGRAM_TOKEN);
    return res.status(200).json({ ok: true });
  }

  // ৩. /status কমান্ড (মিক্রোটিক কানেকশন)
  if (text === '/status') {
    try {
      // Vercel যাতে হ্যাং না হয়, তাই ৫ সেকেন্ডের টাইমআউট
      const api = new RouterOSAPI({
        host: 'remote.cloudmikrotik.online',
        port: 10102,
        user: 'user',
        password: '0000',
        timeout: 5000 
      });
      
      await api.connect();

      const activeUsers = await api.write('/ip/hotspot/active/print');
      const userCount = activeUsers.length;
      const userNames = activeUsers.slice(0, 5).map(u => u.user).join(', ') || 'নেই';

      const resource = await api.write('/system/resource/print');
      const cpu = resource[0]['cpu-load'];
      const uptime = resource[0]['uptime'];

      api.close();

      const replyMessage = `📊 *PK NET Live Report*\n\n👥 মোট ইউজার: ${userCount} জন\n👤 প্রথম ৫ জন: ${userNames}\n🌡️ CPU লোড: ${cpu}%\n⏱️ আপটাইম: ${uptime}`;
      await sendMessage(chatId, replyMessage, TELEGRAM_TOKEN);
      
      // সাকসেস হলে ২০০ পাঠাবো, যাতে জ্যাম না লাগে
      return res.status(200).json({ ok: true });
      
    } catch (error) {
      console.error("Mikrotik API Error:", error);
      // এরর হলেও টেলিগ্রামকে ২০০ পাঠাবো, নাহলে সে বারবার রিকোয়েস্ট পাঠিয়ে জ্যাম করবে
      await sendMessage(chatId, "❌ মিক্রোটিকের সাথে কানেক্ট করা যাচ্ছে না। লাইন বা পোর্ট চেক করুন।", TELEGRAM_TOKEN);
      return res.status(200).json({ ok: true }); 
    }
  }

  // অন্য কোনো হাবিজাবি মেসেজ দিলে
  await sendMessage(chatId, "দুঃখিত, আমি কমান্ডটি বুঝতে পারিনি। মেনু দেখতে /start চাপুন।", TELEGRAM_TOKEN);
  return res.status(200).json({ ok: true });
}

// মেসেজ পাঠানোর জন্য আলাদা ফাংশন (যাতে কোড পরিষ্কার থাকে)
async function sendMessage(chatId, text, token) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}
