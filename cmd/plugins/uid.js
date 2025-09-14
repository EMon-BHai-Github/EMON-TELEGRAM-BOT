module.exports = {
  config: {
    name: "uid",
    credits: "Nayan",
    prefix: true,
    permission: 0,
    aliases: ["id", "myid"],
    description: "Get your Telegram user ID along with profile info"
  },

  start: async ({ event, api }) => {
    const chatId = event.msg.chat.id;
    const user = event.msg.from;

    const userId = user.id;
    const firstName = user.first_name || "Unknown";
    const lastName = user.last_name || "";
    const username = user.username ? `@${user.username}` : "No username";

    // Build a nice HTML formatted message
    const text = `
<b>🆔 Your User Info</b>

👤 Name: <b>${firstName} ${lastName}</b>
💻 Username: <b>${username}</b>
🆔 User ID: <code>${userId}</code>

<i>Keep this ID safe for admin commands or bot features!</i>
`;

    await api.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_to_message_id: event.msg.message_id,
    });
  }
};
