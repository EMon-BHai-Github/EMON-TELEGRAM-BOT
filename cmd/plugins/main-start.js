// cmd/plugins/start.js
// Welcome / Start plugin — VIP EMon-BHai-Bot style

module.exports = {
  config: {
    name: "start",
    credits: "Emon",
    prefix: true,
    aliases: ["start", "welcome"],
    permission: 0,
    description: "Welcome message with bot introduction and stylish banner",
    tags: ["main"]
  },

  start: async ({ api, event }) => {
    try {
      const { msg } = event;
      const chatId = msg.chat.id;
      const user = msg.from;

      const botName = "EMon-BHai-Bot";
      const bannerImg = "https://i.postimg.cc/5ycrKgKw/78fa584d9b11d33eb8155cbbcb98c96e.jpg";

      // Welcome caption with VIP hacker-style
      const caption = `<b>🛡️ Welcome to ${botName} 🛡️</b>\n\n` +
                      `<i>Hi ${user.first_name || "User"}!</i>\n` +
                      `আমি আপনার ডিজিটাল অ্যাসিস্ট্যান্ট 🤖, তৈরি করেছি EMon-BHai।\n\n` +
                      `<b>💡 টিপস:</b>\n` +
                      `• টাইপ /help বা /menu দেখতে কমান্ড লিস্ট।\n` +
                      `• সব ফিচার VIP স্টাইল, নিরাপদ এবং দ্রুত।\n\n` +
                      `────────────────────────────\n` +
                      `<i>⚡ EMon-BHai — Keep stealth, keep coding.</i>`;

      // Send the banner image first
      await api.sendPhoto(chatId, bannerImg, {
        caption: caption,
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id
      });

    } catch (err) {
      console.error("Start plugin error:", err);
      try {
        await api.sendMessage(event.msg.chat.id, "⚠️ শুরু বার্তা পাঠাতে সমস্যা হয়েছে।", { reply_to_message_id: event.msg.message_id });
      } catch(e){}
    }
  }
};
