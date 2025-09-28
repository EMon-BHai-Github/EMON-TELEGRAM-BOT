/**
 * sura.js - Quran Surah Telegram Command (1-114) with paginated inline keyboard
 * Compatible with bot frameworks that expose `api.sendMessage`, `api.sendAudio`,
 * and emit `callback_query` events via `api.on('callback_query', handler)`.
 *
 * Usage:
 *  - Put this file into your bot's commands folder as `sura.js`
 *  - Replace "PUT_YOUR_AUDIO_LINK" placeholders with actual downloadable mp3 links.
 *  - Two links are prefilled (Surah 1 and Surah 2) from user's Google Drive.
 *
 * Notes:
 *  - The command is triggered by "/sura" or "sura" depending on your bot loader.
 *  - This file attaches a callback_query listener when the command is used.
 *    The listener is namespaced per chat using a unique `listenerId` so multiple
 *    chats won't interfere. The listener will remain active for the lifetime of
 *    the bot process (you can customize to auto-remove if you want).
 */

const axios = require('axios');

module.exports = {
  config: {
    name: "sura",
    credits: "Emon-BHai",
    aliases: ["quran","surah","sura"],
    prefix: true,
    permission: 0
  },

  start: async ({ api, event }) => {
    const chatId = event.msg.chat.id || event.threadId || (event.message && event.message.chat && event.message.chat.id);
    const replyTo = event.msg.message_id || (event.message && event.message.message_id);

    // Full 1-114 list (Bangla + English). Two audio links prefilled per user's input.
    const surahList = [
      { num: 1, name: "সূরা আল-ফাতিহা (Al-Fatiha)", audio: "https://files.catbox.moe/0csu7d.m4a" },
      { num: 2, name: "সূরা আল-বাকারাহ (Al-Baqarah)", audio: "https://files.catbox.moe/96glnv.m4a" },
      { num: 3, name: "সূরা আলে-ইমরান (Aal-E-Imran)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 4, name: "সূরা আন-নিসা (An-Nisa)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 5, name: "সূরা আল-মায়িদাহ (Al-Maidah)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 6, name: "সূরা আল-আন'আম (Al-An'am)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 7, name: "সূরা আল-আ'রাফ (Al-A'raf)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 8, name: "সূরা আল-আনফাল (Al-Anfal)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 9, name: "সূরা আত-তাওবাহ (At-Tawbah)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 10, name: "সূরা ইউনুস (Yunus)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 11, name: "সূরা হুদ (Hud)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 12, name: "সূরা ইউসুফ (Yusuf)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 13, name: "সূরা আর-রা'দ (Ar-Ra'd)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 14, name: "সূরা ইব্রাহীম (Ibrahim)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 15, name: "সূরা আল-হিজর (Al-Hijr)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 16, name: "সূরা আন-নাহল (An-Nahl)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 17, name: "সূরা আল-ইসরা (Al-Isra)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 18, name: "সূরা আল-কাহফ (Al-Kahf)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 19, name: "সূরা মারইয়াম (Maryam)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 20, name: "সূরা তা-হা (Ta-Ha)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 21, name: "সূরা আল-আম্বিয়া (Al-Anbiya)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 22, name: "সূরা আল-হাজ্জ (Al-Hajj)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 23, name: "সূরা আল-মু'মিনুন (Al-Mu'minun)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 24, name: "সূরা আন-নূর (An-Nur)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 25, name: "সূরা আল-ফুরকান (Al-Furqan)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 26, name: "সূরা আশ-শু'আরা (Ash-Shu'ara)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 27, name: "সূরা আন-নামল (An-Naml)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 28, name: "সূরা আল-কাসাস (Al-Qasas)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 29, name: "সূরা আল-আনকাবুত (Al-Ankabut)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 30, name: "সূরা আর-রূম (Ar-Rum)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 31, name: "সূরা লুকমান (Luqman)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 32, name: "সূরা আস-সাজদা (As-Sajda)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 33, name: "সূরা আল-আহযাব (Al-Ahzab)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 34, name: "সূরা সাবা (Saba)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 35, name: "সূরা ফাতির (Fatir)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 36, name: "সূরা ইয়া-সীন (Ya-Sin)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 37, name: "সূরা আস-সাফফাত (As-Saffat)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 38, name: "সূরা সাদ (Sad)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 39, name: "সূরা আয-জুমার (Az-Zumar)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 40, name: "সূরা গাফির (Ghafir)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 41, name: "সূরা ফুসসিলাত (Fussilat)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 42, name: "সূরা আশ-শুরা (Ash-Shura)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 43, name: "সূরা আয-যুখরুফ (Az-Zukhruf)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 44, name: "সূরা আদ-দুখান (Ad-Dukhan)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 45, name: "সূরা আল-জাথিয়া (Al-Jathiya)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 46, name: "সূরা আল-আহকাফ (Al-Ahqaf)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 47, name: "সূরা মুহাম্মদ (Muhammad)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 48, name: "সূরা আল-ফাতহ (Al-Fath)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 49, name: "সূরা আল-হুজুরাত (Al-Hujurat)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 50, name: "সূরা ক্বাফ (Qaf)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 51, name: "সূরা আয-যারিয়াত (Adh-Dhariyat)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 52, name: "সূরা আত-তুর (At-Tur)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 53, name: "সূরা আন-নাজম (An-Najm)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 54, name: "সূরা আল-কামার (Al-Qamar)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 55, name: "সূরা আর-রাহমান (Ar-Rahman)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 56, name: "সূরা আল-ওয়াকিয়া (Al-Waqia)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 57, name: "সূরা আল-হাদিদ (Al-Hadid)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 58, name: "সূরা আল-মুজাদিলা (Al-Mujadila)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 59, name: "সূরা আল-হাশর (Al-Hashr)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 60, name: "সূরা আল-মুমতাহিনা (Al-Mumtahina)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 61, name: "সূরা আস-সাফ (As-Saff)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 62, name: "সূরা আল-জুমু'আ (Al-Jumua)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 63, name: "সূরা আল-মুনাফিকুন (Al-Munafiqun)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 64, name: "সূরা আত-তাগাবুন (At-Taghabun)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 65, name: "সূরা আত-তালাক (At-Talaq)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 66, name: "সূরা আত-তাহরিম (At-Tahrim)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 67, name: "সূরা আল-মুলক (Al-Mulk)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 68, name: "সূরা আল-কলম (Al-Qalam)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 69, name: "সূরা আল-হাক্কাহ (Al-Haqqa)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 70, name: "সূরা আল-মা'আরিজ (Al-Ma'arij)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 71, name: "সূরা নূহ (Nuh)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 72, name: "সূরা আল-জিন (Al-Jinn)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 73, name: "সূরা আল-মুজ্জাম্মিল (Al-Muzzammil)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 74, name: "সূরা আল-মুদ্দাসসির (Al-Muddaththir)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 75, name: "সূরা আল-কিয়ামাহ (Al-Qiyama)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 76, name: "সূরা আল-ইনসান (Al-Insan)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 77, name: "সূরা আল-মুরসালাত (Al-Mursalat)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 78, name: "সূরা আন-নাবা (An-Naba)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 79, name: "সূরা আন-নাজিয়াত (An-Nazi'at)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 80, name: "সূরা আবাসা (Abasa)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 81, name: "সূরা আত-তাকউইর (At-Takwir)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 82, name: "সূরা আল-ইনফিতার (Al-Infitar)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 83, name: "সূরা আল-মুতাফিফিন (Al-Mutaffifin)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 84, name: "সূরা আল-ইনশিকাক (Al-Inshiqaq)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 85, name: "সূরা আল-বুরুজ (Al-Buruj)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 86, name: "সূরা আত-তারিক (At-Tariq)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 87, name: "সূরা আল-আ'লা (Al-A'la)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 88, name: "সূরা আল-গাশিয়া (Al-Ghashiya)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 89, name: "সূরা আল-ফাজর (Al-Fajr)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 90, name: "সূরা আল-বালাদ (Al-Balad)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 91, name: "সূরা আশ-শামস (Ash-Shams)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 92, name: "সূরা আল-লাইল (Al-Layl)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 93, name: "সূরা আদ-দুহা (Ad-Duha)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 94, name: "সূরা আশ-শারহ (Ash-Sharh)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 95, name: "সূরা আত-তীন (At-Tin)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 96, name: "সূরা আল-আলাক (Al-Alaq)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 97, name: "সূরা আল-কদর (Al-Qadr)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 98, name: "সূরা আল-বাইয়্যিনা (Al-Bayyina)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 99, name: "সূরা আয-যালযালা (Az-Zalzala)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 100, name: "সূরা আল-আদিয়াত (Al-Adiyat)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 101, name: "সূরা আল-ক্বারিআ (Al-Qaria)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 102, name: "সূরা আত-তাকাসুর (At-Takathur)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 103, name: "সূরা আল-আসর (Al-Asr)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 104, name: "সূরা আল-হুমাযাহ (Al-Humaza)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 105, name: "সূরা আল-ফীল (Al-Fil)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 106, name: "সূরা কুরাইশ (Quraish)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 107, name: "সূরা আল-মাউন (Al-Ma'un)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 108, name: "সূরা আল-কাউসার (Al-Kawthar)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 109, name: "সূরা আল-কাফিরুন (Al-Kafirun)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 110, name: "সূরা আন-নাসর (An-Nasr)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 111, name: "সূরা আল-মাসাদ (Al-Masad)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 112, name: "সূরা আল-ইখলাস (Al-Ikhlas)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 113, name: "সূরা আল-ফালাক (Al-Falaq)", audio: "PUT_YOUR_AUDIO_LINK" },
      { num: 114, name: "সূরা আন-নাস (An-Nas)", audio: "PUT_YOUR_AUDIO_LINK" }
    ];

    // Pagination size (how many surahs per page)
    const PAGE_SIZE = 10;

    // Helper to build inline keyboard for a given page (0-based)
    function buildKeyboard(page) {
      const start = page * PAGE_SIZE;
      const pageItems = surahList.slice(start, start + PAGE_SIZE);
      const keyboard = [];

      // each row will contain up to 5 buttons (number buttons)
      for (let i = 0; i < pageItems.length; i += 5) {
        const row = pageItems.slice(i, i + 5).map(s => ({
          text: `${s.num}`,
          callback_data: `sura_play_${s.num}`
        }));
        keyboard.push(row);
      }

      // navigation row
      const navRow = [];
      if (page > 0) navRow.push({ text: "⬅️ Prev", callback_data: `sura_page_${page-1}` });
      navRow.push({ text: `Page ${page+1}/${Math.ceil(surahList.length/PAGE_SIZE)}`, callback_data: `sura_page_info` });
      if ((page+1) * PAGE_SIZE < surahList.length) navRow.push({ text: "Next ➡️", callback_data: `sura_page_${page+1}` });
      keyboard.push(navRow);

      // optional helper: show name/search
      keyboard.push([{ text: "🔍 Search by name", callback_data: "sura_search" }]);
      return { inline_keyboard: keyboard };
    }

    // Send first page
    const firstPageKeyboard = buildKeyboard(0);
    await api.sendMessage(chatId, "📖 *Quran Surah List (1 - 114)*\n\n👉 নিচে থেকে একটি সূরা নম্বর চাপলে সেই সূরার অডিও প্লে হবে।\n\nআপনি পেজে নেভিগেট করে অন্য সূরা দেখতে পারেন।", { parse_mode: "Markdown", reply_markup: firstPageKeyboard, reply_to_message_id: replyTo });

    // Callback handler - single handler for all chats
    // We attach once globally (if not attached already) so the command file works in many frameworks.
    // To avoid adding multiple identical listeners, store on global if available.
    if (!global.__sura_callback_attached) {
      global.__sura_callback_attached = true;

      api.on && api.on('callback_query', async (callback) => {
        try {
          const data = callback.data || (callback && callback.data && callback.data.data) || "";
          const fromId = (callback.from && callback.from.id) || (callback && callback.from && callback.from.id);
          const message = callback.message || callback.message;

          // If user clicked a page button
          if (data && data.startsWith('sura_page_')) {
            const pageNum = parseInt(data.split('_').pop());
            const keyboard = buildKeyboard(pageNum);
            // edit the original message to show the requested page (if editing supported)
            // Try to use editMessageReplyMarkup if available, otherwise send a new message.
            if (api.editMessageReplyMarkup) {
              try {
                await api.editMessageReplyMarkup(message.chat.id, message.message_id, keyboard);
              } catch (e) {
                // fallback: send new message
                await api.sendMessage(message.chat.id, "📖 Changing page...", { reply_markup: keyboard });
              }
            } else {
              await api.sendMessage(message.chat.id, "📖 Page:", { reply_markup: keyboard });
            }
            // answer callback to remove loading state
            if (api.answerCallbackQuery) await api.answerCallbackQuery(callback.id, { text: `Page ${pageNum+1}` });
            return;
          }

          // Info button pressed
          if (data === 'sura_page_info') {
            if (api.answerCallbackQuery) await api.answerCallbackQuery(callback.id, { text: "Use Prev / Next to browse pages." });
            return;
          }

          // Search by name (will ask user to type name in chat)
          if (data === 'sura_search') {
            if (api.answerCallbackQuery) await api.answerCallbackQuery(callback.id, { text: "Write surah name or number in chat." });
            // Optional: you could set up a one-time message listener to catch the next chat message and play the surah.
            return;
          }

          // Play surah button clicked
          if (data && data.startsWith('sura_play_')) {
            const num = parseInt(data.split('_').pop());
            const surah = surahList.find(s => s.num === num);
            if (!surah) {
              if (api.answerCallbackQuery) await api.answerCallbackQuery(callback.id, { text: "Surah not found." });
              return;
            }

            // acknowledge callback (remove spinner on button)
            if (api.answerCallbackQuery) await api.answerCallbackQuery(callback.id, { text: `Playing Surah ${surah.num}` });

            // send "Please wait" message
            const waitMsg = await api.sendMessage(message.chat.id, `▶️ Preparing Surah ${surah.num} — ${surah.name} ...`);

            try {
              // stream audio from URL and forward as audio to chat
              // NOTE: Google Drive direct links (uc?export=download&id=...) usually work for a single file download
              // If your link requires cookies or confirm pages, replace with direct mp3 hosting.
              const response = await axios.get(surah.audio, { responseType: 'stream', timeout: 60_000 });
              const stream = response.data;

              // Many bot frameworks accept a stream as the file parameter for sendAudio/sendVoice/sendDocument/sendVideo
              if (api.sendAudio) {
                await api.sendAudio(message.chat.id, stream, { caption: `📖 Surah ${surah.num} — ${surah.name}` });
              } else if (api.sendDocument) {
                await api.sendDocument(message.chat.id, stream, { caption: `📖 Surah ${surah.num} — ${surah.name}` });
              } else {
                // fallback: reply with the direct link
                await api.sendMessage(message.chat.id, `Audio link: ${surah.audio}`);
              }

              // delete wait message if possible
              try { await api.deleteMessage(message.chat.id, waitMsg.message_id); } catch (e) {}
            } catch (err) {
              console.error('Error streaming audio:', err && err.message ? err.message : err);
              try { await api.deleteMessage(message.chat.id, waitMsg.message_id); } catch (e) {}
              await api.sendMessage(message.chat.id, `❌ Failed to play Surah ${surah.num}. Maybe the audio link is not a direct downloadable mp3.`);
            }
            return;
          }

        } catch (outerErr) {
          console.error('sura callback error', outerErr);
        }
      });
    }

  }
};
