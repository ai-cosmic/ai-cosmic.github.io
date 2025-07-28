document.addEventListener("DOMContentLoaded", () => {
    // --- Gemini API code---
    /*
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
    */

 

    // --- Mistral AI API logic ---
    /**
     * Get a reply from Mistral AI for a given user message.
     * @param {string} userMessage
     * @returns {Promise<string>} Mistral's reply text
     */
    async function getMistralReply(userMessage) {
        const endpoint = "https://api.mistral.ai/v1/chat/completions";
        const body = {
            // Change model to medium for higher availability
            model: "mistral-medium-latest",
            messages: [
                {
                    role: "system",
                    content: `Your name is Cosmic AI, an intelligent assistant built for answering questions about space. Do not mention "Mistral" or "Google" or refer to yourself using any other name or model type. Always act as Cosmic AI. Stay concise, friendly, and always answer as Cosmic AI. You're Created by "Alan Betty" And "Light."`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        };
        let response;
        try {
            response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
        } catch (networkErr) {
            return "Network error: " + networkErr.message;
        }
        if (!response.ok) {
            let errorText = await response.text();
            // Try to parse error JSON
            let errorObj;
            try {
                errorObj = JSON.parse(errorText);
            } catch {}
            if (errorObj && errorObj.code === "3505") {
                return "Cosmic AI is currently at capacity. Please try again in a few minutes.";
            }
            return "Mistral API error: " + response.status + " " + errorText;
        }
        const data = await response.json();
        return (
            data?.choices?.[0]?.message?.content ||
            "Sorry, I couldn't get a response from Cosmic AI."
        );
    }
    window.getMistralReply = getMistralReply;
    // --- End Mistral AI API logic ---

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
    // Change: userSearchHistory is now an array of session objects: { messages: [...] }
    let currentUser = null;
    let userSearchHistory = []; // Array of { messages: [...] }
    let currentChatSession = []; // Array of { prompt: "...", reply: "..." }

    // --- Guest Session Logic ---
    const isGuest = localStorage.getItem('cosmicai_guest') === 'true';
    let guestPromptCount = Number(localStorage.getItem('cosmicai_guest_prompts') || '0');
    let guestStartTime = Number(localStorage.getItem('cosmicai_guest_start') || '0');
    let guestHistory = JSON.parse(localStorage.getItem('cosmicai_guest_history') || '[]');

    // Override userSearchHistory for guest
    if (isGuest) {
        window.userSearchHistory = guestHistory;
        // Hide logout button text (optional)
        const logoutButton = document.getElementById("logoutButton");
        if (logoutButton) logoutButton.textContent = "Logout (Guest)";
    }

    // --- Firestore setup: block for guest ---
    let db;
    if (!isGuest && typeof firebase !== "undefined" && typeof firebaseConfig !== "undefined") {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized", firebaseConfig);
        }
        db = firebase.firestore();
        firebase.auth().onAuthStateChanged(function(user) {
            console.log("Auth state changed:", user);
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

    // Helper to get user document ID (prefer displayName, fallback to UID)
function getUserDocId() {
    if (currentUser && currentUser.displayName) {
        // Remove spaces and special chars for Firestore doc ID safety
        return currentUser.displayName.replace(/[^a-zA-Z0-9_-]/g, "_");
    }
    return currentUser ? currentUser.uid : "unknown";
}

// ** wLoad search history from Firestore
async function loadUserSearchHistory() {
    if (!db || !currentUser) return;
    try {
        const docId = getUserDocId();
        const doc = await db.collection("users").doc(docId).get();
        userSearchHistory = (doc.exists && Array.isArray(doc.data().searchHistory))
            ? doc.data().searchHistory.map(session => {
                // Migrate old format if needed
                if (session && Array.isArray(session.messages)) {
                    // If messages are [{role, content}], convert to [{prompt, reply}]
                    if (session.messages.length && session.messages[0].role) {
                        const pairs = [];
                        for (let i = 0; i < session.messages.length; i++) {
                            if (session.messages[i].role === "user") {
                                const promptMsg = session.messages[i].content;
                                let replyMsg = "";
                                if (
                                    i + 1 < session.messages.length &&
                                    session.messages[i + 1].role === "assistant"
                                ) {
                                    replyMsg = session.messages[i + 1].content;
                                    i++;
                                }
                                pairs.push({ prompt: promptMsg, reply: replyMsg });
                            }
                        }
                        return { messages: pairs };
                    }
                    // Already in new format
                    return { messages: session.messages.map(m =>
                        m.user !== undefined
                            ? { prompt: m.user, reply: m.reply }
                            : m
                    ) };
                }
                return { messages: [] };
            })
            : [];
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
        const docId = getUserDocId();
        await db.collection("users").doc(docId).set(
            { searchHistory: userSearchHistory },
            { merge: true }
        );
        window.userSearchHistory = userSearchHistory;
        if (typeof renderSidebarHistory === "function") setTimeout(renderSidebarHistory, 0);
    } catch (e) {
        console.error("Firestore save error:", e);
    }
}

// --- DOM Elements (move to top, before usage) ---
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("searchInput");
    const chatMessages = document.getElementById("chatMessages");
    const clearHistoryButton = document.getElementById("clearHistoryButton"); // <-- add here
    const newChatButton = document.getElementById("newChatButton"); // Add reference

    // Guard: if any required element is missing, do nothing
    if (!chatForm || !chatInput || !chatMessages) return;

    // --- Add appendChatMessage function ---
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

        // Smooth scroll to bottom
        setTimeout(smoothScrollChatMessages, 0);

        return bubble;
    }

    function smoothScrollChatMessages() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: "smooth"
        });
    }

    // --- Add escapeHTML function if not present ---
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

    let chatFormDocked = false;

    // --- New Chat Button handler: start a new chat session ---
    if (newChatButton) {
        newChatButton.addEventListener("click", () => {
            if (currentChatSession.length > 0) {
                // Save current session to history as { messages: [...] }
                userSearchHistory.push({ messages: currentChatSession });
                if (userSearchHistory.length > 50) userSearchHistory = userSearchHistory.slice(-50);
                saveUserSearchHistory();
            }
            currentChatSession = [];
            // Clear chatMessages UI
            chatMessages.innerHTML = "";
            chatMessages.classList.add("hidden");
            chatFormDocked = false;
            // Show/hide title as needed
            const cosmicAITitle = document.getElementById("cosmicAITitle");
            if (cosmicAITitle) {
                cosmicAITitle.style.display = "";
                cosmicAITitle.style.opacity = "1";
                cosmicAITitle.style.transform = "";
            }
            // Reset chat form position
            chatForm.classList.remove("fixed", "bottom-0", "left-1/2", "-translate-x-1/2", "px-4", "pb-6", "z-20");
            chatForm.style.position = "";
            chatForm.style.left = "";
            chatForm.style.top = "";
            chatForm.style.width = "";
            chatForm.style.transform = "";
            // Reset input
            chatInput.value = "";
        });
    }

    // --- Chat submit handler ---
    chatForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // Show chatMessages container on first message
        if (chatMessages.classList.contains("hidden")) {
            chatMessages.classList.remove("hidden");
        }

        // Add new message object with prompt, reply is empty for now
        currentChatSession.push({ prompt: msg, reply: "" });

        // --- Auto-save session after user message ---
        if (currentChatSession.length === 1) {
            userSearchHistory.push({ messages: [...currentChatSession] });
        } else {
            userSearchHistory[userSearchHistory.length - 1].messages = [...currentChatSession];
        }
        if (userSearchHistory.length > 50) userSearchHistory = userSearchHistory.slice(-50);
        saveUserSearchHistory();

        // --- Animate chat form from its original position to the bottom smoothly and keep it perfectly centered
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
        // Ensure scroll after user message
        smoothScrollChatMessages();

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
                // Set reply for the last message
                currentChatSession[currentChatSession.length - 1].reply = `[Image] ${imageUrl}`;
                userSearchHistory[userSearchHistory.length - 1].messages = [...currentChatSession];
                saveUserSearchHistory();
                smoothScrollChatMessages();
            } catch (err) {
                botMsgDiv.classList.remove("italic");
                botMsgDiv.innerHTML =
                    `<span class="font-bold text-gray-300">Cosmic AI:</span> Sorry, there was an error generating the image.<br><span class='text-xs text-gray-400'>` +
                    escapeHTML(err.message) + "</span>";
                currentChatSession[currentChatSession.length - 1].reply = `Error: ${err.message}`;
                userSearchHistory[userSearchHistory.length - 1].messages = [...currentChatSession];
                saveUserSearchHistory();
                smoothScrollChatMessages();
            }
            return;
        }

        // Show only Mistral's reply, no custom or history messages
        const botMsgDiv = appendChatMessage("Cosmic AI", "Thinking...", "bot", true);
        try {
            const reply = await getMistralReply(msg);
            botMsgDiv.classList.remove("italic");
            if (reply && reply.trim()) {
                botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span> <span>${escapeHTML(reply)}</span>`;
                // Set reply for the last message
                currentChatSession[currentChatSession.length - 1].reply = reply;
                userSearchHistory[userSearchHistory.length - 1].messages = [...currentChatSession];
                saveUserSearchHistory();
                smoothScrollChatMessages();
            } else {
                botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span> <span>Sorry, I couldn't get a response from Cosmic AI.</span>`;
                currentChatSession[currentChatSession.length - 1].reply = "Sorry, I couldn't get a response from Cosmic AI.";
                userSearchHistory[userSearchHistory.length - 1].messages = [...currentChatSession];
                saveUserSearchHistory();
                smoothScrollChatMessages();
            }
        } catch (err) {
            botMsgDiv.classList.remove("italic");
            let errMsg = "Sorry, there was an error contacting Cosmic AI.";
            if (err && err.message) {
                errMsg += "<br><span class='text-xs text-gray-400'>" + escapeHTML(err.message) + "</span>";
            }
            botMsgDiv.innerHTML = `<span class="font-bold text-gray-300">Cosmic AI:</span> <span>${errMsg}</span>`;
            currentChatSession[currentChatSession.length - 1].reply = errMsg;
            userSearchHistory[userSearchHistory.length - 1].messages = [...currentChatSession];
            saveUserSearchHistory();
            smoothScrollChatMessages();
        }

        // --- Guest prompt limit and time check ---
        if (isGuest) {
            guestPromptCount++;
            localStorage.setItem('cosmicai_guest_prompts', guestPromptCount.toString());
            // 3 prompt limit
            if (guestPromptCount > 3) {
                alert("Guest access is limited to 3 prompts. Please log in or register to continue using Cosmic AI.");
                doLogout(false);
                return;
            }
            // 15 minute limit
            const now = Date.now();
            if (guestStartTime && now - guestStartTime > 15 * 60 * 1000) {
                alert("Guest session expired (15 minutes). Please log in or register to continue.");
                doLogout(false);
                return;
            }
        }

        // --- Save history for guest ---
        if (isGuest) {
            // Save session in guestHistory (local only)
            if (currentChatSession.length === 1) {
                guestHistory.push({ messages: [...currentChatSession] });
            } else {
                guestHistory[guestHistory.length - 1].messages = [...currentChatSession];
            }
            if (guestHistory.length > 50) guestHistory = guestHistory.slice(-50);
            localStorage.setItem('cosmicai_guest_history', JSON.stringify(guestHistory));
            window.userSearchHistory = guestHistory;
            if (typeof renderSidebarHistory === "function") setTimeout(renderSidebarHistory, 0);
        } else {
            // ...existing code for Firestore...
        }
    });

    // --- Logout function ---
    function doLogout(auto) {
        // Clear guest data if guest
        if (isGuest) {
            localStorage.removeItem('cosmicai_guest');
            localStorage.removeItem('cosmicai_guest_start');
            localStorage.removeItem('cosmicai_guest_prompts');
            localStorage.removeItem('cosmicai_guest_history');
            window.location.replace("login.html");
            return;
        }
        if (typeof firebase !== "undefined" && firebase.auth) {
            firebase.auth().signOut().then(() => {
                localStorage.removeItem("cosmicai_login_time");
                // Optionally clear other user data here
                if (auto) {
                    alert("You have been automatically logged out for security. Please log in again.");
                }
                window.location.replace("index.html");
            });
        } else {
            // Fallback: just redirect
            localStorage.removeItem("cosmicai_login_time");
            window.location.replace("login.html");
        }
    }
    window.doLogout = doLogout;

    // --- Auto-logout for guest after 15 minutes ---
    function checkGuestTimeout() {
        if (isGuest) {
            const now = Date.now();
            if (guestStartTime && now - guestStartTime > 15 * 60 * 1000) {
                alert("Guest session expired (15 minutes). Please log in or register to continue.");
                doLogout(false);
            }
        }
    }
    setInterval(checkGuestTimeout, 60000); // Check every minute

    // --- Add checkAutoLogout stub to prevent ReferenceError ---
    if (typeof checkAutoLogout !== "function") {
        function checkAutoLogout() {
            // No-op: implement auto-logout logic here if needed
        }
    }

    // --- Set login timestamp on login ---
    if (typeof firebase !== "undefined" && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            // ...existing code...
            if (user) {
                // Set login timestamp if not already set
                if (!localStorage.getItem("cosmicai_login_time")) {
                    localStorage.setItem("cosmicai_login_time", Date.now().toString());
                }
                checkAutoLogout();
            } else {
                localStorage.removeItem("cosmicai_login_time");
            }
        });
    }

    // --- Logout button click handler ---
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            doLogout(false);
        });
    }

    // --- Also check auto-logout on every page load ---
    checkAutoLogout();

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

    // --- Clear History Function ---
    async function clearUserHistory() {
        userSearchHistory = [];
        window.userSearchHistory = userSearchHistory;
        currentChatSession = [];
        if (typeof renderSidebarHistory === "function") renderSidebarHistory();
        if (db && currentUser) {
            try {
                const docId = getUserDocId();
                await db.collection("users").doc(docId).set(
                    { searchHistory: [] },
                    { merge: true }
                );
            } catch (e) {
                console.error("Error clearing history in Firestore:", e);
            }
        }
    }
    window.clearUserHistory = clearUserHistory;

    // --- Clear History Button Handler ---
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener("click", async function() {
            if (confirm("Are you sure you want to clear your search history? This cannot be undone.")) {
                await clearUserHistory();
                alert("Your search history has been cleared.");
            }
        });
    }
});

console.warn("You're Crossing the Limits. Better go back. - Cosmic AI");