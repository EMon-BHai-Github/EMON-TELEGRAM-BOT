// cmd/plugins/help.js
// EMon-BHai-Bot Menu — polished VIP hacker style

const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    credits: "Emon",
    aliases: ["menu", "commands"],
    prefix: true,
    permission: 0,
    description: "সব উপলব্ধ কমান্ড দেখাবে (auto-loaded from cmd/plugins)."
  },

  start: async ({ api, event }) => {
    try {
      const { msg } = event;
      const chatId = msg.chat.id;
      const fromId = msg.from.id;

      // Load owner & bot config
      const cfgPath = path.join(__dirname, "..", "..", "config.json");
      let ownerConf = {};
      try { ownerConf = require(cfgPath); } catch (e) {}
      const ownerId = ownerConf.OWNER_ID || ownerConf.owner || "Unknown";
      const ownerUsername = ownerConf.OWNER_USERNAME || "EMONHOWLADER";
      const botName = ownerConf.BOT_NAME || "EMon-BHai-Bot";

      // Load plugins
      const pluginsDir = __dirname;
      const files = fs.existsSync(pluginsDir) ? fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js")) : [];

      const cmds = [];
      for (const f of files) {
        const pPath = path.join(pluginsDir, f);
        try { delete require.cache[require.resolve(pPath)]; } catch(e){}
        try {
          const p = require(pPath);
          if(p?.config?.name) {
            cmds.push({
              name: p.config.name,
              aliases: p.config.aliases || [],
              desc: p.config.description || "",
              credits: p.config.credits || ""
            });
          }
        } catch(e) {
          cmds.push({
            name: f.replace(".js",""),
            aliases: [],
            desc: `⚠️ Failed to load: ${e.message.split("\n")[0]}`,
            credits: ""
          });
        }
      }

      // Sort commands
      cmds.sort((a,b) => a.name.localeCompare(b.name));

      // Build message
      const headerImg = "https://i.postimg.cc/5ycrKgKw/78fa584d9b11d33eb8155cbbcb98c96e.jpg";
      const headerTitle = `<b>🛡️ ${botName} — Menu 🛡️</b>`;
      const welcome = `<i>স্বাগতম, ${msg.from.first_name || msg.from.username || "User"}</i>`;
      const ownerLine = `<b>👑 OWNER:</b> <a href="https://t.me/${ownerUsername}">${ownerUsername}</a>`;
      const totalLine = `<b>📜 মোট কমান্ড:</b> <code>${cmds.length}</code>`;
      const footer = `────────────────────────────\n⚡ EMon-BHai — Keep stealth, keep coding.`;

      // Build compact list
      let compactList = "";
      for (const c of cmds) {
        const aliasText = c.aliases.length ? ` <i>(${c.aliases.join(", ")})</i>` : "";
        compactList += `⚡ <b>/${c.name}</b>${aliasText}\n`;
      }
      const tip = `<i>টিপ:</i> নতুন প্লাগইন যোগ করলে এখানে নিজে থেকেই যুক্ত হবে।`;

      // Send banner image
      try {
        await api.sendPhoto(chatId, headerImg, {
          caption: `${headerTitle}\n${welcome}`,
          parse_mode: "HTML",
          reply_to_message_id: msg.message_id
        });
      } catch {}

      const text = `${headerTitle}\n${welcome}\n\n${ownerLine}\n${totalLine}\n\n${compactList}\n${tip}\n${footer}`;

      // Send main help with inline keyboard
      const sent = await api.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Full List", callback_data: "help_full" }, { text: "❌ Close", callback_data: "help_close" }],
            [{ text: "💬 Contact Owner", url: `https://t.me/${ownerUsername}` }]
          ]
        }
      });

      // Callback handler
      const handler = async (callback) => {
        try {
          const data = callback.data || "";
          const from = callback.from || {};
          if (from.id !== fromId && String(from.id) !== String(ownerId)) {
            return api.answerCallbackQuery(callback.id, { text: "আপনি এই মেনু এডিট করতে পারবেন না।", show_alert: false });
          }
          if (!callback.message) return api.answerCallbackQuery(callback.id, { text: "No message.", show_alert: false });

          if(data === "help_full") {
            let full = `<b>📚 Full Command List — ${botName}</b>\n\n`;
            for(const c of cmds) {
              const aliasText = c.aliases.length ? ` <i>(${c.aliases.join(", ")})</i>` : "";
              const descText = c.desc ? `\n<code>⟫</code> ${c.desc}` : "";
              full += `⚡ <b>/${c.name}</b>${aliasText}${descText}\n\n`;
            }
            full += footer;
            await api.editMessageText(full, {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [[
                  { text: "🔙 Back", callback_data: "help_back" },
                  { text: "❌ Close", callback_data: "help_close" }
                ]]
              }
            });
            return api.answerCallbackQuery(callback.id);
          }

          if(data === "help_back") {
            await api.editMessageText(text, {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "📋 Full List", callback_data: "help_full" }, { text: "❌ Close", callback_data: "help_close" }],
                  [{ text: "💬 Contact Owner", url: `https://t.me/${ownerUsername}` }]
                ]
              }
            });
            return api.answerCallbackQuery(callback.id);
          }

          if(data === "help_close") {
            await api.editMessageText(`<b>✅ Menu closed</b>\n\n🔒 আপনি চাইলে /help আবার চালাতে পারেন.`, {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML"
            });
            await api.answerCallbackQuery(callback.id, { text: "Closed." });
            return api.removeListener && api.removeListener('callback_query', handler);
          }

        } catch(e) {
          try{ await api.answerCallbackQuery(callback.id, { text: "Internal error.", show_alert: false }); } catch{}
        }
      };

      api.on && api.on("callback_query", handler);
      setTimeout(() => { try{ api.removeListener && api.removeListener("callback_query", handler); } catch{} }, 1000*60*5);

    } catch (err) {
      console.error("Help plugin error:", err);
      try { await api.sendMessage(event.msg.chat.id, "⚠️ হেল্প দেখাতে সমস্যা হয়েছে।", { reply_to_message_id: event.msg.message_id }); } catch{}
    }
  }
};
