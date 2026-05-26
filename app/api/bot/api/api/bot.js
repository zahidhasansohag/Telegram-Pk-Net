export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: "PK NET Bot is 100% LIVE Sohag Bhai!" });
  }

  if (req.method === 'POST') {
    const body = req.body;
    const chatId = body.message?.chat?.id;
    const text = body.message?.text;
    const adminId = 6855051736;

    if (!chatId || !text) {
      return res.status(200).json({ ok: true });
    }

    let reply = "দুঃখিত, আমি কমান্ডটি বুঝতে পারিনি। মেনু দেখতে /start চাপুন।";

    if (chatId === adminId && text === '/status') {
      reply = "✅ PK NET Router is UP\n👥 অ্যাক্টিভ ইউজার: ২০ জন\n🌡️ CPU: ৫%";
    } else if (chatId === adminId && text === '/sales') {
      reply = "💰 আজকের মোট বিক্রি: ২৫০ টাকা\n🎟️ ভাউচার: ৫টি";
    } else if (text === '/start') {
      reply = "স্বাগতম PK NET-এ! 🌐\nকীভাবে সাহায্য করতে পারি?\n\nপ্যাকেজ দেখতে /packages লিখুন";
    } else if (text === '/packages') {
      reply = "📦 আমাদের প্যাকেজসমূহ:\n১. ১ দিন - ১৫ টাকা\n২. ৭ দিন - ৭০ টাকা\n৩. ৩০ দিন - ২৫০ টাকা";
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: reply })
      });
    } catch (error) {
      console.error(error);
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
