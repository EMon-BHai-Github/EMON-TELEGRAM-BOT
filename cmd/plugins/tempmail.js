const axios = require("axios");

const BASE_URL = "http://api.guerrillamail.com/ajax.php";

let session = {
  phpsessid: null,
  email: null,
  seq: 0,
};

async function gmRequest(func, params = {}) {
  const url = BASE_URL;
  const ip = "127.0.0.1";
  const agent = "Bot-TempMail";

  const data = new URLSearchParams({ f: func, ip, agent, ...params });

  const headers = {};
  if (session.phpsessid) {
    headers["Cookie"] = `PHPSESSID=${session.phpsessid}`;
  }

  const res = await axios.post(url, data, { headers });

  // Cookie capture
  const setCookie = res.headers["set-cookie"];
  if (setCookie) {
    const match = setCookie.find(c => c.startsWith("PHPSESSID"));
    if (match) {
      session.phpsessid = match.split(";")[0].split("=")[1];
    }
  }

  return res.data;
}

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["mail", "guerrillamail"],
    permission: 0,
    prefix: "auto",
    description: "Temporary Email (GuerrillaMail API)",
    category: "Utility",
    credits: "EMon",
  },

  start: async ({ event, api }) => {
    const { threadId, msg } = event;
    const args = msg.text.split(" ").slice(1);
    const subCmd = args[0] || "help";

    try {
      // NEW MAIL
      if (subCmd === "new") {
        const data = await gmRequest("get_email_address", { lang: "en" });
        session.email = data.email_addr;
        await api.sendMessage(
          threadId,
          `📧 TEMPMAIL INFO\n━━━━━━━━━━━━━━\n✉️ Email: ${session.email}\n⏳ Expires: 1h\n━━━━━━━━━━━━━━\nUse /tempmail list to check inbox`,
          { reply_to_message_id: msg.message_id }
        );
      }

      // INBOX LIST
      else if (subCmd === "list") {
        if (!session.email) {
          return api.sendMessage(threadId, "⚠️ First create email using /tempmail new", {
            reply_to_message_id: msg.message_id,
          });
        }
        const data = await gmRequest("check_email", { seq: session.seq });
        if (!data.list || data.list.length === 0) {
          return api.sendMessage(threadId, "📭 Inbox empty!", {
            reply_to_message_id: msg.message_id,
          });
        }
        session.seq = data.list[0].mail_id;
        let inbox = data.list
          .map(
            (m, i) =>
              `📩 ${i + 1}. From: ${m.mail_from}\n🔹 Subject: ${m.mail_subject}\n🕒 Date: ${m.mail_date}\n🆔 ID: ${m.mail_id}`
          )
          .join("\n\n");

        await api.sendMessage(
          threadId,
          `📥 INBOX (${data.list.length})\n━━━━━━━━━━━━━━\n${inbox}`,
          { reply_to_message_id: msg.message_id }
        );
      }

      // READ MAIL
      else if (subCmd === "read") {
        const mailId = args[1];
        if (!mailId) {
          return api.sendMessage(
            threadId,
            "⚠️ Usage: /tempmail read <mail_id>",
            { reply_to_message_id: msg.message_id }
          );
        }
        const mail = await gmRequest("fetch_email", { email_id: mailId });
        await api.sendMessage(
          threadId,
          `📖 EMAIL CONTENT\n━━━━━━━━━━━━━━\n📝 Subject: ${mail.mail_subject}\n👤 From: ${mail.mail_from}\n━━━━━━━━━━━━━━\n${mail.mail_body || "⚠️ No Content"}`,
          { reply_to_message_id: msg.message_id }
        );
      }

      // DELETE MAIL
      else if (subCmd === "delete") {
        const mailId = args[1];
        if (!mailId) {
          return api.sendMessage(
            threadId,
            "⚠️ Usage: /tempmail delete <mail_id>",
            { reply_to_message_id: msg.message_id }
          );
        }
        await gmRequest("del_email", { email_ids: mailId });
        await api.sendMessage(
          threadId,
          `🗑️ Mail ID ${mailId} deleted.`,
          { reply_to_message_id: msg.message_id }
        );
      }

      // FORGET SESSION
      else if (subCmd === "forget") {
        await gmRequest("forget_me", { email_addr: session.email });
        session = { phpsessid: null, email: null, seq: 0 };
        await api.sendMessage(
          threadId,
          `🗑️ TempMail session forgotten.`,
          { reply_to_message_id: msg.message_id }
        );
      }

      // HELP
      else {
        await api.sendMessage(
          threadId,
          `⚙️ TempMail Commands:\n━━━━━━━━━━━━━━\n/tempmail new → Create new temp mail\n/tempmail list → Show inbox\n/tempmail read <id> → Read email\n/tempmail delete <id> → Delete mail\n/tempmail forget → Forget session`,
          { reply_to_message_id: msg.message_id }
        );
      }
    } catch (err) {
      console.error(err);
      await api.sendMessage(
        threadId,
        "❌ Error: GuerrillaMail API failed.",
        { reply_to_message_id: msg.message_id }
      );
    }
  },
};
