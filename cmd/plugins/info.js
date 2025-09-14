module.exports = {
  config: {
    name: "info",
    prefix: "auto",
    credits: "Nayan",
    aliases: ["info", "details"],
    permission: 0,
    description: "Displays detailed information about the admin, bot, and server",
    tags: ["Utility"],
  },

  start: async ({ event, api }) => {
    const { threadId, msg } = event;

    const n = await api.getMe();

    const formatUptime = (uptime) => {
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
    };

    const uptime = formatUptime(process.uptime());

    const headerImg = "https://i.postimg.cc/5ycrKgKw/78fa584d9b11d33eb8155cbbcb98c96e.jpg";

    const htmlContent = `
<b>═════ 🌟 Admin Info 🌟 ═════</b>
👤 Name           : <b>EMON HAWLADAR</b>
🌐 Facebook       : <a href="https://www.facebook.com/EMon.BHai.FACEBOOK">Profile Link</a>
🕌 Religion       : Islam
🏠 Permanent Addr : Dhaka
📍 Current Addr   : Malaysia
⚧ Gender         : Male
🎂 Age            : 23+
💖 Relationship   : Single
💼 Work           : job
✉️ Email          : <a href="mailto:emonhawladar311@gmail.com">emonhawladar311@gmail.com</a>
📱 WhatsApp       : <a href="https://wa.me/+8801309991724">Chat</a>
💬 Telegram       : <a href="https://t.me/EMONHAWLADAR">t.me/EMONHAWLADAR</a>

<b>═════ 🤖 Bot Info 🤖 ═════</b>
📝 Bot Name       : ${n.first_name || "N/A"}
🔗 Bot Username   : ${n.username ? `@${n.username}` : "N/A"}
🆔 Bot ID         : ${n.id || "N/A"}

<b>═════ 💻 Server Info 💻 ═════</b>
⏱️ Uptime         : ${uptime}
🖥️ Node Version   : ${process.version}
💾 Memory Used    : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB

<b>════════════════════════════</b>
`;

    // Send photo + info as one card
    try {
      await api.sendPhoto(threadId, headerImg, {
        caption: htmlContent,
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
      });
    } catch (e) {
      await api.sendMessage(threadId, htmlContent, {
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
      });
    }
  }
};
