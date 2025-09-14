// cmd/plugins/bin.js
// Random BIN Generator — Auto-update on each generate

const crypto = require("crypto");

module.exports = {
  config: {
    name: "bin",
    credits: "Emon",
    aliases: ["generatebin", "cardgen"],
    prefix: true,
    permission: 0,
    description: "Generates a random BIN with expiry and CVV",
  },

  start: async ({ event, api }) => {
    const chatId = event.msg.chat.id;
    const userId = event.msg.from.id;

    const generateBIN = () => {
      const bin = "400000" + Math.floor(Math.random() * 1000000000).toString().padStart(10, "0");
      const expiryMonth = String(Math.floor(Math.random() * 12 + 1)).padStart(2, "0");
      const expiryYear = String(Math.floor(Math.random() * 6 + 25));
      const cvv = String(Math.floor(Math.random() * 900 + 100));
      return {
        bin,
        expiry: `${expiryMonth}/${expiryYear}`,
        cvv,
        type: Math.random() < 0.5 ? "Visa" : "MasterCard",
      };
    };

    const sendOrEditBIN = async (messageId = null) => {
      const card = generateBIN();
      const text = `💳 <b>Random Card ( EMon-BHai )</b>\n\n` +
                   `<b>BIN:</b> ${card.bin}\n` +
                   `<b>Expire:</b> ${card.expiry}\n` +
                   `<b>CVV:</b> ${card.cvv}\n` +
                   `<b>Type:</b> ${card.type}`;

      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Generate Again", callback_data: "bin_generate" }],
            [{ text: "💬 Contact Owner", url: "https://t.me/EMONHAWLADAR" }],
          ],
        },
      };

      if (messageId) {
        return await api.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "HTML",
          reply_markup: replyMarkup.reply_markup
        });
      } else {
        return await api.sendMessage(chatId, text, { parse_mode: "HTML", ...replyMarkup });
      }
    };

    const sentMsg = await sendOrEditBIN();

    const handler = async (callback) => {
      try {
        if (!callback.data) return;

        if (callback.data === "bin_generate" && callback.from.id === userId) {
          // Edit the same message instead of sending new
          await sendOrEditBIN(callback.message.message_id);
          await api.answerCallbackQuery(callback.id);
        } else {
          await api.answerCallbackQuery(callback.id, { text: "You cannot use this button.", show_alert: true });
        }
      } catch (e) { console.error(e); }
    };

    api.on && api.on("callback_query", handler);

    // Auto remove listener after 10 mins to avoid memory leaks
    setTimeout(() => {
      try { api.removeListener && api.removeListener("callback_query", handler); } catch(e) {}
    }, 1000 * 60 * 10);
  },
};
          
