const axios = require('axios');

module.exports = {
    name: 'lyrics',
    alias: ['lyric', 'ly'],
    desc: 'Fetches lyrics for a song.',
    run: async ({ sock, msg, args, sender }) => {
        if (!args.length) return sock.sendMessage(sender, { text: '❌ Provide a song name!\nExample: !lyrics Bohemian Rhapsody' });

        const query = args.join(' ');
        await sock.sendMessage(sender, { text: '🎵 Fetching lyrics...' });

        try {
            // Using lyrics.ovh API (Free, no key needed)
            const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`;
            
            // Note: lyrics.ovh works best with "Artist Song" format. 
            // If you want to search by just song name, you might need a different API or parsing.
            // For a robust solution, we try to guess artist from common knowledge or just search the song name directly if the API supports it.
            
            // Alternative: Use Genius API or Musixmatch for better search, but they require keys.
            // Let's try a direct search fallback if the first one fails.

            let data;
            try {
                const res = await axios.get(url);
                data = res.data;
            } catch (e) {
                // Fallback: Try a more generic search if available, or notify user
                return sock.sendMessage(sender, { text: '❌ Could not find lyrics for that specific query. Try "Artist Song" format.' });
            }

            if (!data.lyrics) {
                return sock.sendMessage(sender, { text: '❌ Lyrics not found.' });
            }

            // Truncate if too long for WhatsApp text (limit ~4000 chars)
            let lyricText = data.lyrics;
            if (lyricText.length > 4000) {
                lyricText = lyricText.substring(0, 4000) + '\n\n... (more on the way)';
            }

            await sock.sendMessage(sender, { 
                text: `🎶 **${data.song}** - ${data.artist}\n\n${lyricText}` 
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(sender, { text: '❌ Failed to fetch lyrics.' });
        }
    }
};
