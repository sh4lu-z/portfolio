// Minimalist Portfolio - Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio loaded successfully.');
    
    // Fetch YouTube Videos automatically
    fetchYouTubeVideos();
});

async function fetchYouTubeVideos() {
    const container = document.getElementById('youtube-video-container');
    if (!container) return; // Only run if the container exists on the page

    // IMPORTANT: Replace this with your actual YouTube Channel ID
    // You can find it by going to your channel -> About -> Share -> Copy channel ID
    // Or use a site like commentpicker.com/youtube-channel-id.php
    // Example: 'UC_x5XG1OV2P6uZZ5FSM9Ttw' (Google Developers)
    const channelId = 'UCFVwP1p6BiDbKdzFy2On27Q'; 
    
    const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = ''; // Clear the "Loading..." text
            
            data.items.forEach(item => {
                // Create the video card link
                const videoCard = document.createElement('a');
                videoCard.href = item.link;
                videoCard.className = 'video-card';
                videoCard.target = '_blank';

                // Create the thumbnail image
                const img = document.createElement('img');
                // Try to use the maxresdefault (highest quality) thumbnail if available
                img.src = item.thumbnail.replace('hqdefault', 'maxresdefault');
                // Fallback if maxresdefault doesn't exist (browser handles broken images, but we can just use hqdefault to be safe)
                // Actually, rss2json usually returns hqdefault. Let's just use what they give.
                img.src = item.thumbnail; 
                img.alt = item.title;

                // Create the title paragraph
                const title = document.createElement('p');
                title.textContent = item.title;

                // Append elements
                videoCard.appendChild(img);
                videoCard.appendChild(title);
                container.appendChild(videoCard);
            });
        } else {
            container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">No videos found or invalid Channel ID.</p>';
        }
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">Error loading videos. Please check your connection.</p>';
    }
}
