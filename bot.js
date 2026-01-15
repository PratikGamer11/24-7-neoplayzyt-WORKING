const mineflayer = require("mineflayer");
const fs = require("fs");

// LOAD SETTINGS (SAFE)
const settings = JSON.parse(
  fs.readFileSync("./settings.json", "utf8")
);

// CREATE BOT
const bot = mineflayer.createBot({
  host: settings.server.ip,
  port: settings.server.port,
  username: settings.bot-account.username,
  version: settings.server.version,
  auth: settings.bot-account.type
});

// LOGIN
bot.once("spawn", () => {
  console.log("✅ Bot spawned");

  // AUTO AUTH
  if (settings.utils["auto-auth"].enabled) {
    setTimeout(() => {
      bot.chat(`/login ${settings.utils["auto-auth"].password}`);
    }, 3000);
  }

  // CHAT MESSAGES
  if (settings.utils["chat-messages"].enabled) {
    let i = 0;
    setInterval(() => {
      bot.chat(settings.utils["chat-messages"].messages[i]);
      i = (i + 1) % settings.utils["chat-messages"].messages.length;
    }, settings.utils["chat-messages"]["repeat-delay"] * 1000);
  }
});

// ANTI AFK
setInterval(() => {
  if (!settings.utils["anti-afk"].enabled) return;
  bot.setControlState("jump", true);
  setTimeout(() => bot.setControlState("jump", false), 300);
}, 15000);

// AUTO RECONNECT
bot.on("end", () => {
  console.log("❌ Disconnected");
  if (settings.utils["auto-reconnect"]) {
    setTimeout(() => {
      process.exit(1);
    }, settings.utils["auto-reconnect-delay"]);
  }
});

// ERROR LOG
bot.on("error", err => {
  console.log("⚠️ ERROR:", err.message);
});
