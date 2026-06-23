/**
 * Minimalist Portfolio - Main JavaScript
 * Handles YouTube video fetching and other UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio loaded successfully.');

    // Fetch YouTube Videos automatically
    fetchYouTubeVideos();
});

async function fetchYouTubeVideos() {
    const container = document.getElementById('youtube-video-container');

    if (!container) return;

    const channelId = 'UCFVwP1p6BiDbKdzFy2On27Q';

    const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {

            container.innerHTML = '';

            data.items.forEach(item => {

                const highResThumb = item.thumbnail.replace('hqdefault', 'mqdefault');

                const videoHTML = `
                    <a href="${item.link}" class="video-card" target="_blank" rel="noopener noreferrer">
                        <img src="${highResThumb}" alt="${item.title}" loading="lazy">
                        <p>${item.title}</p>
                    </a>
                `;

                container.insertAdjacentHTML('beforeend', videoHTML);
            });

            console.log('YouTube videos loaded successfully!');
        } else {

            container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">No videos found. Please check your Channel ID or connection.</p>';
            console.warn('YouTube API warning: Status not OK or no items found.');
        }
    } catch (error) {

        console.error('Error fetching YouTube videos:', error);
        container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">Error loading videos. Try refreshing the page.</p>';
    }
}
