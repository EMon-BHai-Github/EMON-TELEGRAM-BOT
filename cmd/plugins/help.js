// cmd/plugins/help.js
// VIP Bangla help menu — banner + commands in one message

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

  start: async ({ api, event, pluginsLoad }) => {
    try {
      const { msg } = event;
      const chatId = msg.chat.id;
      const fromId = msg.from.id;

      const cfgPath = path.join(__dirname, "..", "..", "config.json");
      let ownerConf = {};
      try { ownerConf = require(cfgPath); } catch(e){ ownerConf = {}; }

      const ownerId = ownerConf.OWNER_ID || ownerConf.owner || "Unknown";
      const ownerUsername = ownerConf.OWNER_USERNAME || "EMONHAWLADAR";
      const botName = ownerConf.BOT_NAME || "EMon-BHai-Bot";

      // Load commands from plugins folder
      const cmds = pluginsLoad.map(p => ({
        name: p.config.name,
        aliases: p.config.aliases || [],
        desc: p.config.description || "",
        credits: p.config.credits || ""
      })).sort((a,b) => a.name.localeCompare(b.name));

      const headerImg = "https://i.postimg.cc/5ycrKgKw/78fa584d9b11d33eb8155cbbcb98c96e.jpg";
      const headerTitle = `<b>🛡️ ${botName} — VIP Menu 🛡️</b>`;
      const welcome = `<i>স্বাগতম, ${msg.from.first_name || msg.from.username || "User"}</i>`;
      const ownerLine = ownerUsername ? `<b>👑 OWNER:</b> <a href="https://t.me/${ownerUsername}">${ownerUsername}</a>` : `<b>👑 OWNER ID:</b> <code>${ownerId}</code>`;
      const totalLine = `<b>📜 মোট কমান্ড:</b> <code>${cmds.length}</code>`;
      const footer = `────────────────────────────\n⚡ EMon-BHai — Keep stealth, keep coding.`;

      // Pagination settings
      const commandsPerPage = 10;
      let currentPage = 1;
      const totalPages = Math.ceil(cmds.length / commandsPerPage);

      const buildPageText = (page) => {
        const start = (page - 1) * commandsPerPage;
        const end = start + commandsPerPage;
        let list = "";
        cmds.slice(start, end).forEach(c => {
          const aliasText = c.aliases.length ? ` <i>(aliases: ${c.aliases.join(", ")})</i>` : "";
          list += `<b>• /${c.name}</b>${aliasText}\n`;
        });
        return `${headerTitle}\n${welcome}\n\n${ownerLine}\n${totalLine}\n\n${list}\n<i>টিপ:</i> নতুন প্লাগইন যুক্ত হলে এখানে স্বয়ংক্রিয়ভাবে দেখাবে।\n${footer}\n\n📄 Page ${page}/${totalPages}`;
      };

      const buildKeyboard = (page) => {
        const start = (page - 1) * commandsPerPage;
        const end = start + commandsPerPage;
        const pageCmds = cmds.slice(start, end);
        const rows = pageCmds.map(c => [{ text: c.name, callback_data: `help:command:${c.name}` }]);
        const nav = [];
        if (page > 1) nav.push({ text: '⬅️ Previous', callback_data: `help:prev:${page - 1}` });
        if (page < totalPages) nav.push({ text: '➡️ Next', callback_data: `help:next:${page + 1}` });
        if (nav.length) rows.push(nav);
        rows.push([{ text: "📋 Full List", callback_data: "help_full" }, { text: "❌ Close", callback_data: "help_close" }]);
        rows.push([{ text: "💬 Contact Owner", url: ownerUsername ? `https://t.me/${ownerUsername}` : `https://t.me/${ownerId}` }]);
        return { inline_keyboard: rows };
      };

      // Send VIP banner + help in one message
      try {
        await api.sendPhoto(chatId, headerImg, {
          caption: buildPageText(currentPage),
          parse_mode: "HTML",
          reply_to_message_id: msg.message_id,
          reply_markup: buildKeyboard(currentPage)
        });
      } catch(e){
        // fallback: send text only if photo fails
        await api.sendMessage(chatId, buildPageText(currentPage), { parse_mode: "HTML", reply_to_message_id: msg.message_id, reply_markup: buildKeyboard(currentPage) });
      }

      const handler = async (callback) => {
        try {
          const data = callback.data || "";
          const from = callback.from || {};
          if (from.id !== fromId && String(from.id) !== String(ownerId)) return api.answerCallbackQuery(callback.id, { text: "আপনি এই মেনু এডিট করতে পারবেন না।", show_alert: false });
          if (!callback.message) return api.answerCallbackQuery(callback.id, { text: "No message.", show_alert: false });

          const [action, type, param] = data.split(":");
          if (action !== "help") return;

          if (type === "next" || type === "prev") {
            currentPage = parseInt(param);
            await api.editMessageCaption(buildPageText(currentPage), {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML",
              reply_markup: buildKeyboard(currentPage)
            });
            return api.answerCallbackQuery(callback.id);
          }

          if (type === "command") {
            const plugin = cmds.find(c => c.name === param);
            if (!plugin) return api.answerCallbackQuery(callback.id, { text: "Command not found." });
            const permMsg = plugin.permission === 2 ? "⚠️ Admin only" : "✅ All users can use";
            const aliasMsg = plugin.aliases.length ? `Aliases: ${plugin.aliases.join(", ")}` : "Aliases: undefined";
            await api.answerCallbackQuery(callback.id, { text: `Command selected: ${param}` });
            return api.sendMessage(chatId,
              `ℹ️ Command: <b>${plugin.name}</b>\nCredits: ${plugin.credits || "Unknown"}\nPermission: ${permMsg}\nDescription: ${plugin.desc || "No description"}\n${aliasMsg}`,
              { parse_mode: "HTML" }
            );
          }

          if (type === "help_full") {
            let full = `<b>📚 Full Command List — ${botName}</b>\n\n`;
            cmds.forEach(c => {
              const aliasText = c.aliases.length ? ` <i>(${c.aliases.join(", ")})</i>` : "";
              const descText = c.desc ? `\n<code>⟫</code> ${c.desc}` : "";
              full += `<b>• /${c.name}</b>${aliasText}${descText}\n\n`;
            });
            full += `\n${footer}`;
            await api.editMessageText(full, {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML",
              reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "help_back" }, { text: "❌ Close", callback_data: "help_close" }]] }
            });
            return api.answerCallbackQuery(callback.id);
          }

          if (type === "help_back") {
            await api.editMessageCaption(buildPageText(currentPage), {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML",
              reply_markup: buildKeyboard(currentPage)
            });
            return api.answerCallbackQuery(callback.id);
          }

          if (type === "help_close") {
            await api.editMessageText(`<b>✅ Menu closed</b>\n\n🔒 আপনি চাইলে /help আবার চালাতে পারেন.`, {
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              parse_mode: "HTML"
            });
            await api.answerCallbackQuery(callback.id, { text: "Closed." });
            api.removeListener && api.removeListener("callback_query", handler);
          }

        } catch(e){ try{ await api.answerCallbackQuery(callback.id, { text: "Internal error.", show_alert: false }); } catch{} }
      };

      api.on && api.on("callback_query", handler);
      setTimeout(() => { try{ api.removeListener && api.removeListener("callback_query", handler); } catch{} }, 1000*60*5);

    } catch(err){
      console.error("Help plugin error:", err);
      try { await api.sendMessage(event.msg.chat.id, "⚠️ হেল্প দেখাতে সমস্যা হয়েছে।", { reply_to_message_id: msg.message_id }); } catch{}
    }
  }
};
              
