document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Mobile Menu Logic ---
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMenuBtn');
    const navLinks = document.querySelectorAll('.nav-links a');

    openBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // --- 2. Search Functionality ---
    const searchInput = document.getElementById('searchInput');
    const navLinksContainer = document.getElementById('navLinks');
    
    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        const links = navLinksContainer.getElementsByTagName('a');
        
        for (let i = 0; i < links.length; i++) {
            const txtValue = links[i].textContent || links[i].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                links[i].style.display = "block";
            } else {
                links[i].style.display = "none";
            }
        }
    });

    // --- 3. Copy Logic with Base URL Support ---
    const copyButtons = document.querySelectorAll('.copy-btn');
    const baseUrlInput = document.getElementById('baseUrlInput');
    
    // Function to format the URL (removes trailing slashes from base URL)
    const getFullUrl = (endpoint) => {
        let base = baseUrlInput.value.trim();
        if(base.endsWith('/')) {
            base = base.slice(0, -1);
        }
        return `${base}${endpoint}`;
    };

    copyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            let textToCopy = "";

            // Check if it's an endpoint copy button
            if (this.classList.contains('endpoint-copy')) {
                const endpoint = this.getAttribute('data-endpoint');
                textToCopy = getFullUrl(endpoint);
            } 
            // Check if it's the Base URL copy button itself
            else if (this.id === 'copyBaseBtn') {
                textToCopy = baseUrlInput.value;
            }
            // Check if it's a code block copy button
            else if (this.classList.contains('code-copy')) {
                const preElement = this.nextElementSibling;
                if(preElement) textToCopy = preElement.innerText;
            }

            try {
                await navigator.clipboard.writeText(textToCopy);
                
                const originalHTML = this.innerHTML;
                this.innerHTML = "Copied!";
                this.classList.add('copied');

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
