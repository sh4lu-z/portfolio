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
    
    // පේජ් එකේ කන්ටේනර් එක නැත්නම් script එක රන් වෙන්නේ නැහැ
    if (!container) return; 

    /**
     * වැදගත්: ඔයාගේ Channel ID එක නිවැරදිද කියලා ආයෙත් චෙක් කරන්න.
     * දැනට තියෙන්නේ: UCFVwP1p6BiDbKdzFy2On27Q
     */
    const channelId = 'UCFVwP1p6BiDbKdzFy2On27Q'; 
    
    const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            // "Loading..." ටෙක්ස්ට් එක අයින් කරනවා
            container.innerHTML = ''; 
            
            data.items.forEach(item => {
                // Thumbnail එකේ Quality එක වැඩි කරමු (hqdefault එක mqdefault වලට මාරු කරනවා)
                const highResThumb = item.thumbnail.replace('hqdefault', 'mqdefault');

                // HTML එක structure කරන විදිහ (Clean coding)
                const videoHTML = `
                    <a href="${item.link}" class="video-card" target="_blank" rel="noopener noreferrer">
                        <img src="${highResThumb}" alt="${item.title}" loading="lazy">
                        <p>${item.title}</p>
                    </a>
                `;
                
                // කන්ටේනර් එකට අලුත් වීඩියෝ කාඩ් එක ඇඩ් කරනවා
                container.insertAdjacentHTML('beforeend', videoHTML);
            });
            
            console.log('YouTube videos loaded successfully!');
        } else {
            // වීඩියෝ නැත්නම් හෝ error එකක් ආවොත් පෙන්වන මැසේජ් එක
            container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">No videos found. Please check your Channel ID or connection.</p>';
            console.warn('YouTube API warning: Status not OK or no items found.');
        }
    } catch (error) {
        // Fetch කිරීමේදී එන errors (Network error, etc.)
        console.error('Error fetching YouTube videos:', error);
        container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">Error loading videos. Try refreshing the page.</p>';
    }
}
