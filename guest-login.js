// Guest login logic: Firebase anonymous auth, local history, prompt limit

(function() {
    // Only run on login.html
    if (!/login\.html$/i.test(window.location.pathname)) return;

    // Guest login handler
    const guestLoginLink = document.getElementById('guestLoginLink');
    if (guestLoginLink) {
        guestLoginLink.addEventListener('click', async () => {
            try {
                if (typeof firebase !== "undefined" && firebase.auth) {
                    const auth = firebase.auth();
                    // Start anonymous sign-in
                    await auth.signInAnonymously();
                    // Wait for onAuthStateChanged to confirm
                    auth.onAuthStateChanged(function(user) {
                        if (user && user.isAnonymous) {
                            localStorage.setItem('cosmicai_guest', 'true');
                            localStorage.setItem('cosmicai_guest_start', Date.now().toString());
                            localStorage.setItem('cosmicai_guest_prompts', '0');
                            localStorage.setItem('cosmicai_guest_history', '[]');
                            localStorage.removeItem('cosmicai_login_time');
                            window.location.href = "main.html";
                            
                        }
                    });
                } else {
                    alert("Firebase not loaded. Please try again.");
                }
            } catch (err) {
                alert("Unable to start guest session. Please try again.");
            }
        });
    }

    // On main.html, enforce guest prompt limit and registration prompt
    if (/main\.html$/i.test(window.location.pathname)) {
        // If not anonymous, clear guest flags
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof firebase !== "undefined" && firebase.auth) {
                firebase.auth().onAuthStateChanged(function(user) {
                    if (!user || !user.isAnonymous) {
                        localStorage.removeItem('cosmicai_guest');
                        localStorage.removeItem('cosmicai_guest_start');
                        localStorage.removeItem('cosmicai_guest_prompts');
                        localStorage.removeItem('cosmicai_guest_history');
                    }
                });
            }

            let guestPromptCount = Number(localStorage.getItem('cosmicai_guest_prompts') || '0');
            let guestStartTime = Number(localStorage.getItem('cosmicai_guest_start') || '0');
            let guestHistory = JSON.parse(localStorage.getItem('cosmicai_guest_history') || '[]');

            const chatForm = document.getElementById("chatForm");
            const chatInput = document.getElementById("searchInput");
            if (!chatForm || !chatInput) return;

            chatForm.addEventListener("submit", function(e) {
                if (localStorage.getItem('cosmicai_guest') !== 'true') return;
                guestPromptCount++;
                localStorage.setItem('cosmicai_guest_prompts', guestPromptCount.toString());
                // Save prompt to local guest history only
                guestHistory.push({ prompt: chatInput.value.trim(), reply: "" });
                localStorage.setItem('cosmicai_guest_history', JSON.stringify(guestHistory));

                // After 3 prompts, show registration prompt and block further input
                if (guestPromptCount > 3) {
                    e.preventDefault();
                    alert("Guest access is limited to 3 prompts. Please create an account to continue using Cosmic AI.");
                    // Sign out anonymous user and clear guest flags
                    if (typeof firebase !== "undefined" && firebase.auth) {
                        firebase.auth().signOut();
                    }
                    localStorage.removeItem('cosmicai_guest');
                    localStorage.removeItem('cosmicai_guest_start');
                    localStorage.removeItem('cosmicai_guest_prompts');
                    localStorage.removeItem('cosmicai_guest_history');
                    window.location.replace("login.html");
                    return false;
                }
            }, true);
        });
    }
})();
