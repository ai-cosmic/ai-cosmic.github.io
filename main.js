document.addEventListener("DOMContentLoaded", () => {
    // --- Login check removed, now handled in auth-check.js ---

    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    // Add system prompt
    const systemPrompt = `
// Your name is **Cosmic AI**, an intelligent assistant built for answering questions about space.
Do not mention "Gemini" or refer to yourself using any other name or model type. Always act as Cosmic AI.

About Cosmic AI:
Cosmic AI is a next-generation assistant designed to help users explore powerful AI tools, automation features, and smart integrations.
It is fast, helpful, creative, and tailored to guide users through everything related to modern AI products.

Stay concise, friendly, and always answer as Cosmic AI.
`;
    // Use correct input and form IDs
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("searchInput"); // Fix: use searchInput
    const chatMessages = document.getElementById("chatMessages");

    // Guard: if any required element is missing, do nothing
    if (!chatForm || !chatInput || !chatMessages) return;

    function appendChatMessage(sender, text, type, isPlaceholder) {
        // Create a wrapper for alignment and centering
        const wrapper = document.createElement("div");
        wrapper.className = "chat-bubble-wrapper " + (type === "user" ? "user" : "ai");

        // Bubble
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble " + (type === "user" ? "chat-bubble-user" : "chat-bubble-ai");
        bubble.innerHTML = `<span>${escapeHTML(text)}</span>`;
        if (isPlaceholder) {
            bubble.classList.add("italic");
            bubble.innerHTML += ' <span class="loader"></span>';
        }

        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);

        // Always scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return bubble;
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

    // --- Gemini API logic merged from gemini.js ---
    /**
     * Get a reply from Gemini API for a given user message.
     * @param {string} userMessage
     * @returns {Promise<string>} Gemini's reply text
     */
    async function getGeminiReply(userMessage) {
        const body = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nUser: " + userMessage }]
                }
            ]
        };
        let response;
        try {
            response = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        } catch (networkErr) {
            return "Network error: " + networkErr.message;
        }
        if (!response.ok) {
            let errorText = await response.text();
            return "Gemini API error: " + response.status + " " + errorText;
        }
        const data = await response.json();
        return (
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't get a response from Cosmic AI."
        );
    }
    // Make function available globally if needed (for /image command)
    window.getGeminiReply = getGeminiReply;
    // --- End Gemini API logic ---

    // --- Leap AI image generation via backend ---
    async function getLeapAIImage(prompt) {
        // Change '/leap-image' to 'http://localhost:3000/leap-image'
        const response = await fetch("http://localhost:3000/leap-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });
        if (!response.ok) {
            let errorText = await response.text();
            throw new Error("Backend error: " + response.status + " " + errorText);
        }
        const data = await response.json();
        if (!data.imageUrl) throw new Error("No image URL returned from backend.");
        return data.imageUrl;
    }
    window.getLeapAIImage = getLeapAIImage;
    // --- End Leap AI image generation via backend ---

    // --- Firebase Firestore for user search history ---
    let currentUser = null;
    let userSearchHistory = [];

    // Firestore setup (assumes firebase/app and firebase/firestore are loaded globally)
    let db;
    if (typeof firebase !== "undefined" && typeof firebaseConfig !== "undefined") {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        firebase.auth().onAuthStateChanged(function(user) {
            currentUser = user;
            if (user) {
                loadUserSearchHistory();
            } else {
                userSearchHistory = [];
                window.userSearchHistory = userSearchHistory;
                if (typeof renderSidebarHistory === "function") renderSidebarHistory();
            }
        });
    }

    // Load search history from Firestore
    async function loadUserSearchHistory() {
        if (!db || !currentUser) return;
        try {
            const doc = await db.collection("users").doc(currentUser.uid).get();
            userSearchHistory = (doc.exists && doc.data().searchHistory) ? doc.data().searchHistory : [];
            window.userSearchHistory = userSearchHistory;
            if (typeof renderSidebarHistory === "function") setTimeout(renderSidebarHistory, 0);
        } catch (e) {
            userSearchHistory = [];
            window.userSearchHistory = userSearchHistory;
            if (typeof renderSidebarHistory === "function") setTimeout(renderSidebarHistory, 0);
        }
    }

    // Save search history to Firestore
    async function saveUserSearchHistory() {
        if (!db || !currentUser) return;
        try {
            await db.collection("users").doc(currentUser.uid).set(
                { searchHistory: userSearchHistory },
                { merge: true }
            );
            window.userSearchHistory = userSearchHistory;
            if (typeof renderSidebarHistory === "function") setTimeout(renderSidebarHistory, 0);
        } catch (e) {
            console.error("Firestore save error:", e);
        }
    }

    let chatFormDocked = false;

    chatForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // Show chatMessages container on first message
        if (chatMessages.classList.contains("hidden")) {
            chatMessages.classList.remove("hidden");
        }

        // Save to user search history if enabled and logged in
        if (typeof isSearchHistorySaved === "undefined" || isSearchHistorySaved) {
            if (currentUser) {
                userSearchHistory.push(msg);
                // Keep only the latest 50 entries (optional)
                if (userSearchHistory.length > 50) userSearchHistory = userSearchHistory.slice(-50);
                saveUserSearchHistory();
                if (typeof renderSidebarHistory === "function") renderSidebarHistory();
            }
        }

        // Animate chat form from its original position to the bottom smoothly and keep it perfectly centered
        if (!chatFormDocked) {
            // Get bounding rects
            const rect = chatForm.getBoundingClientRect();
            const mainRect = chatForm.parentElement.getBoundingClientRect();
            // Calculate start position (centered relative to parent)
            const startLeft = rect.left - mainRect.left;
            const startTop = rect.top - mainRect.top;
            chatForm.style.position = "absolute";
            chatForm.style.left = "50%";
            chatForm.style.transform = `translateX(-50%)`;
            chatForm.style.top = `${startTop}px`;
            chatForm.style.width = `${rect.width}px`;
            chatForm.style.transition = "top 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s cubic-bezier(0.4,0,0.2,1)";
            chatForm.style.zIndex = "20";

            // Target position: horizontally centered at the bottom
            const mainHeight = mainRect.height;
            const formHeight = rect.height;
            const targetTop = mainHeight - formHeight - 24; // 24px for padding

            // Animate to bottom (remains centered)
            setTimeout(() => {
                chatForm.style.top = `${targetTop}px`;
                chatForm.style.opacity = "1";
            }, 10);

            // After animation, switch to fixed bottom positioning and remove inline styles
            setTimeout(() => {
                chatForm.style.transition = "";
                chatForm.style.position = "";
                chatForm.style.left = "";
                chatForm.style.top = "";
                chatForm.style.width = "";
                chatForm.style.transform = "";
                chatForm.classList.add("fixed", "bottom-0", "left-1/2", "-translate-x-1/2", "px-4", "pb-6", "z-20");
            }, 750);

            // Animate chatMessages margin
            if (chatMessages) {
                chatMessages.style.transition = "margin-bottom 0.7s cubic-bezier(0.4,0,0.2,1)";
                chatMessages.style.marginBottom = "110px";
            }
            // Animate/hide the title smoothly
            const cosmicAITitle = document.getElementById("cosmicAITitle");
            if (cosmicAITitle) {
                cosmicAITitle.style.transition = "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)";
                cosmicAITitle.style.opacity = "0";
                cosmicAITitle.style.transform = "translateY(-40px) scale(0.95)";
                setTimeout(() => {
                    cosmicAITitle.style.display = "none";
                }, 700);
            }
            chatFormDocked = true;
        }

        // Remove placeholder if present
        const placeholder = chatMessages.querySelector(".italic");
        if (placeholder) placeholder.remove();
        appendChatMessage("You", msg, "user");
        chatInput.value = "";

        // If the message starts with "/image ", treat as image generation
        if (msg.toLowerCase().startsWith("/image ")) {
            const prompt = msg.slice(7).trim();
            const botMsgDiv = appendChatMessage("Cosmic AI", "Generating image", "bot", true);
            try {
                const imageUrl = await window.getLeapAIImage(prompt);
                botMsgDiv.classList.remove("italic");
                botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span><br>
                    <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(prompt)}" class="rounded-lg max-w-xs max-h-80 mt-2" /><br>
                    <span class="text-xs text-gray-400">${escapeHTML(prompt)}</span>`;
            } catch (err) {
                botMsgDiv.classList.remove("italic");
                botMsgDiv.innerHTML =
                    `<span class="font-bold text-gray-300">Cosmic AI:</span> Sorry, there was an error generating the image.<br><span class='text-xs text-gray-400'>` +
                    escapeHTML(err.message) + "</span>";
            }
            return;
        }

        // Show only Gemini's reply, no custom or history messages
        const botMsgDiv = appendChatMessage("Cosmic AI", "Thinking...", "bot", true);
        try {
            const reply = await getGeminiReply(msg);
            botMsgDiv.classList.remove("italic");
            if (reply && reply.trim()) {
                botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span> <span>${escapeHTML(reply)}</span>`;
            } else {
                botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span> <span>Sorry, I couldn't get a response from Cosmic AI.</span>`;
            }
        } catch (err) {
            botMsgDiv.classList.remove("italic");
            let errMsg = "Sorry, there was an error contacting Cosmic AI.";
            if (err && err.message) {
                errMsg += "<br><span class='text-xs text-gray-400'>" + escapeHTML(err.message) + "</span>";
            }
            botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span> <span>${errMsg}</span>`;
        }
    });

    // If you have a function to populate history in the UI, update it to use userSearchHistory
    // Example:
    function populateHistory() {
        // ...existing code...
        const historyArr = (typeof userSearchHistory !== "undefined" && userSearchHistory.length)
            ? userSearchHistory
            : [];
        // Use historyArr instead of searchHistory
        // ...existing code...
    }
});