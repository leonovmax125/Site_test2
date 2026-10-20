import { loadEnvFile } from "node:process";
try{loadEnvFile(".env.local");}catch{}
const token=process.env.TELEGRAM_BOT_TOKEN;
if(!token){console.error("Добавьте TELEGRAM_BOT_TOKEN в .env.local. Не присылайте токен в чат.");process.exit(1);}
try{
 const response=await fetch(`https://api.telegram.org/bot${token}/getUpdates`,{signal:AbortSignal.timeout(15000)});
 const data=await response.json();
 if(!response.ok||!data.ok)throw new Error();
 const chats=new Map();for(const update of data.result){const chat=(update.message||update.my_chat_member)?.chat;if(chat)chats.set(chat.id,{id:chat.id,type:chat.type});}
 if(!chats.size)console.log("Откройте вашего бота, нажмите Start и повторите команду.");
 else for(const chat of chats.values())console.log(`TELEGRAM_CHAT_ID=${chat.id} (${chat.type})`);
}catch{console.error("Не удалось получить список чатов. Проверьте доступ к Telegram и токен в .env.local.");process.exit(1);}
