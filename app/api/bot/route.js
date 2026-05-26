import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const chatId = body.message?.chat?.id;
    const text = body.message?.text;
    
    // আপনার নিজের টেলিগ্রাম আইডি (অ্যাডমিন)
    const adminId = 6855051736; 

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    let reply = "";

    // === অ্যাডমিন কমান্ড (শুধু আপনি দেখতে পাবেন) ===
    if (chatId === adminId && text === '/status') {
      reply = "✅ PK NET Router is UP\n👥 অ্যাক্টিভ ইউজার: ২০ জন\n🌡️ CPU ব্যবহার: ৫%";
    } 
    else if (chatId === adminId && text === '/sales') {
      reply = "💰 আজকের মোট বিক্রি: ২৫০ টাকা\n🎟️ ভাউচার অ্যাক্টিভ হয়েছে: ৫টি";
    }
    
    // === কাস্টমার কমান্ড (সবাই দেখতে পাবে) ===
    else if (text === '/start') {
      reply = "স্বাগতম PK NET-এ! 🌐\nকীভাবে সাহায্য করতে পারি?\n\nপ্যাকেজ দেখতে /packages চাপুন\nসাহায্যের জন্য /help চাপুন";
    } 
    else if (text === '/packages') {
      reply = "📦 আমাদের প্যাকেজসমূহ:\n১. ১ দিন - ১৫ টাকা\n২. ৭ দিন - ৭০ টাকা\n৩. ৩০ দিন - ২৫০ টাকা\n\nভাউচার কিনতে অ্যাডমিনের সাথে যোগাযোগ করুন।";
    } 
    else if (text === '/help') {
      reply = "📞 যেকোনো প্রয়োজনে কল করুন: 01XXXXXXXXX\nঅথবা আমাদের ফেসবুক পেজে মেসেজ দিন।";
    } 
    else {
      reply = "দুঃখিত, আমি কমান্ডটি বুঝতে পারিনি। মেনু দেখতে /start চাপুন।";
    }

    // টেলিগ্রামে রিপ্লাই পাঠানোর কোড
    const token = process.env.TELEGRAM_BOT_TOKEN; 
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bot Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
