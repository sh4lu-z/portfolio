document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Mobile Menu Logic ---
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMenuBtn');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Open Menu
    openBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    // Close Menu
    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Close menu when a link is clicked on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // --- 2. Search Functionality (Now completely fixed!) ---
    const searchInput = document.getElementById('searchInput');
    const navLinksContainer = document.getElementById('navLinks');
    
    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        const links = navLinksContainer.getElementsByTagName('a');
        
        for (let i = 0; i < links.length; i++) {
            const txtValue = links[i].textContent || links[i].innerText;
            // If the text matches the search query, show it, otherwise hide it
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                links[i].style.display = "block";
            } else {
                links[i].style.display = "none";
            }
        }
    });

    // --- 3. Copy Button Logic ---
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            let textToCopy = "";

            // Determine what to copy based on button class/attributes
            if (this.hasAttribute('data-copy')) {
                // It's the endpoint copy button
                textToCopy = this.getAttribute('data-copy');
            } else if (this.classList.contains('code-copy')) {
                // It's the code block copy button
                const preElement = this.nextElementSibling;
                if(preElement) textToCopy = preElement.innerText;
            }

            try {
                // Copy to clipboard
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback
                const originalHTML = this.innerHTML;
                this.innerHTML = "Copied!";
                this.classList.add('copied');

                // Reset after 2 seconds
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.classList.remove('copied');
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy text: ', err);
                this.innerHTML = "Error!";
                setTimeout(() => { this.innerHTML = "Copy"; }, 2000);
            }
        });
    });
});
