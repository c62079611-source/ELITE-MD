const ytSearch = require('yt-search');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'play',
    alias: ['song', 'music', 'ytp'],
    desc: 'Downloads and sends the actual audio file of the song.',
    run: async ({ sock, msg, args, sender }) => {
        if (!args.length) return sock.sendMessage(sender, { text: '❌ Provide a song name!\nExample: !play Bohemian Rhapsody' });

        const query = args.join(' ');
        await sock.sendMessage(sender, { text: '🔍 Searching...' });

        try {
            // 1. Search YouTube
            const searchResult = await ytSearch(query);
            if (!searchResult.videos || searchResult.videos.length === 0) {
                return sock.sendMessage(sender, { text: '❌ Song not found.' });
            }

            const videoId = searchResult.videos[0].videoId;
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            const title = searchResult.videos[0].title;

            // 2. Download Audio Stream
            const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
            
            // 3. Save to temp file
            const filePath = path.join(__dirname, '../tmp/play_' + Date.now() + '.mp3');
            const writeStream = fs.createWriteStream(filePath);
            
            stream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
                writeStream.on('finish', resolve); // Fallback
            });

            // 4. Send as Audio Document
            const buffer = fs.readFileSync(filePath);
            fs.unlinkSync(filePath); // Clean up

            await sock.sendMessage(sender, { 
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: false // Send as real file, not voice note
            }, { quoted: msg });

            await sock.sendMessage(sender, { text: `✅ Played: ${title}` });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(sender, { text: '❌ Failed to play. Try again later.' });
        }
    }
};
