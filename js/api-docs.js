document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.api-section');
    const navLinksContainer = document.getElementById('navLinks');
    const sidebar = document.getElementById('sidebar');

    // 1. Generate Sidebar Links Dynamically
    sections.forEach(section => {
        const id = section.getAttribute('id');
        const title = section.getAttribute('data-title');
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = title;
        
        // Close sidebar on mobile when a link is clicked
        link.addEventListener('click', () => {
            if(window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });

        navLinksContainer.appendChild(link);
    });

    // 2. Mobile Menu Toggle
    document.getElementById('openMenuBtn').addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    document.getElementById('closeMenuBtn').addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // 3. Search Box Functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', function() {
        const filter = searchInput.value.toLowerCase();
        const links = navLinksContainer.getElementsByTagName('a');
        
        for (let i = 0; i < links.length; i++) {
            const txtValue = links[i].textContent || links[i].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                links[i].style.display = "";
            } else {
                links[i].style.display = "none";
            }
        }
    });

    // 4. Copy to Clipboard Functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            let textToCopy = "";

            // Check if it's an endpoint copy or a code block copy
            if (this.classList.contains('endpoint-copy')) {
                textToCopy = this.getAttribute('data-copy');
            } else if (this.classList.contains('code-copy')) {
                // Get the text from the next element which is the <pre> tag
                const preElement = this.nextElementSibling;
                textToCopy = preElement.innerText;
            }

            // Copy to clipboard
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Change button appearance to show success
                const originalText = this.innerText;
                this.innerText = "Copied!";
                this.classList.add('copied');

                // Revert back after 2 seconds
                setTimeout(() => {
                    this.innerText = originalText;
                    this.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });
});
