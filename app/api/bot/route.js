import { NextResponse } from 'next/server';

// Browser e test korar jonno (GET request)
export async function GET() {
  return NextResponse.json({ message: "PK NET Bot is 100% LIVE!" });
}

// Telegram theke message ashar jonno (POST request)
export async function POST(req) {
  try {
    const body = await req.json();
    const chatId = body.message?.chat?.id;
    const text = body.message?.text;
    
    const adminId = 6855051736; 

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    let reply = "";

    if (chatId === adminId && text === '/status') {
      reply = "✅ PK NET Router is UP\n👥 Active User: 20 Jon\n🌡️ CPU: 5%";
    } 
    else if (chatId === adminId && text === '/sales') {
      reply = "💰 Ajker Sale: 250 Taka\n🎟️ Voucher: 5 Ti";
    }
    else if (text === '/start') {
      reply = "Swagatom PK NET-e! 🌐\nKivabe sahajjo korte pari?\n\nPackage dekhte /packages likhun";
    } 
    else if (text === '/packages') {
      reply = "📦 Amader Packages:\n1. 1 Din - 15 Taka\n2. 7 Din - 70 Taka\n3. 30 Din - 250 Taka";
    } 
    else {
      reply = "Bujhte parini. Menu dekhte /start chapun.";
    }

    const token = process.env.TELEGRAM_BOT_TOKEN; 
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
