async function fetchYouTubeVideos() {
    const container = document.getElementById('youtube-video-container');
    if (!container) return;

    const channelId = 'UCFVwP1p6BiDbKdzFy2On27Q'; 
    const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = ''; 

            data.items.forEach(item => {
                // thumbnail එකේ quality එක වැඩි කරමු
                const highResThumb = item.thumbnail.replace('hqdefault', 'mqdefault'); // mqdefault ගොඩක් වෙලාවට වැඩ කරනවා

                const videoHTML = `
                    <a href="${item.link}" class="video-card" target="_blank" rel="noopener noreferrer">
                        <img src="${highResThumb}" alt="${item.title}" loading="lazy">
                        <p>${item.title}</p>
                    </a>
                `;
                container.insertAdjacentHTML('beforeend', videoHTML);
            });
        } else {
            container.innerHTML = '<p>No videos found.</p>';
        }
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        container.innerHTML = '<p>Error loading videos.</p>';
    }
}
