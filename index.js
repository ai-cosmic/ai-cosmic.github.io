let currentPage = "home";
const fullText = "Ask Cosmic AI...";
const typingSpeed = 100;
let typedTextElement;
let typingIntervalId;
let isDarkMode = true; // Dark mode by default

document.addEventListener("DOMContentLoaded", (event) => {
    typedTextElement = document.getElementById("typedText");
    startTypingEffect();

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        applyTheme("light");
    } else {
        // Default to dark mode if no preference or preference is dark
        applyTheme("dark");
    }

    // Set initial page visibility
    updatePageVisibility();

    // Add event listener for the dark mode toggle button
    const darkModeToggleBtn = document.getElementById("darkModeToggle");
    if (darkModeToggleBtn) {
        darkModeToggleBtn.addEventListener("click", toggleDarkMode);
    }

    // Chat form logic
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (msg) {
                appendChatMessage("You", msg, "user");
                chatInput.value = "";
                setTimeout(() => {
                    appendChatMessage("Cosmic AI", getBotReply(msg), "bot");
                }, 700);
            }
        });
    }
});

function startTypingEffect() {
    let i = 0;
    if (typingIntervalId) {
        clearInterval(typingIntervalId);
    }
    if (typedTextElement) {
        typedTextElement.textContent = "";
    }

    typingIntervalId = setInterval(() => {
        if (typedTextElement && i < fullText.length) {
            typedTextElement.textContent += fullText.charAt(i);
            i++;
        } else {
            clearInterval(typingIntervalId);
        }
    }, typingSpeed);
}

function updatePageVisibility() {
    document.querySelectorAll(".page-content").forEach((page) => {
        page.classList.remove("active");
    });
    const activePageElement = document.getElementById(
        currentPage + "-page"
    );
    if (activePageElement) {
        activePageElement.classList.add("active");
        document.body.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function setCurrentPage(pageName) {
    currentPage = pageName;
    updatePageVisibility();
}

function scrollToSection(id) {
    if (currentPage !== "home") {
        currentPage = "home";
        updatePageVisibility();
        setTimeout(() => {
            const section = document.getElementById(id);
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    } else {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    }
}

function applyTheme(theme) {
    const moonIcon = document.getElementById("moonIcon");
    const sunIcon = document.getElementById("sunIcon");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
        if (moonIcon) moonIcon.classList.add("hidden");
        if (sunIcon) sunIcon.classList.remove("hidden");
        isDarkMode = true;
    } else {
        document.body.classList.remove("dark-mode");
        if (moonIcon) moonIcon.classList.remove("hidden");
        if (sunIcon) sunIcon.classList.add("hidden");
        isDarkMode = false;
    }
    localStorage.setItem("theme", theme); // Save preference
}

function toggleDarkMode() {
    if (isDarkMode) {
        applyTheme("light");
    } else {
        applyTheme("dark");
    }
}

function appendChatMessage(sender, text, type) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = type === "user"
        ? "mb-2 text-right"
        : "mb-2 text-left";
    msgDiv.innerHTML = `<span class="font-bold ${type === "user" ? 'text-\[\#FF5733\]' : 'text-gray-300'}">${sender}:</span> <span>${escapeHTML(text)}</span>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotReply(userMsg) {
    // Placeholder bot reply
    return "I'm just a demo! Real AI chat coming soon.";
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}