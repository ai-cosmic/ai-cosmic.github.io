// --- Theme Configurations ---
        const themeConfigs = {
            'nebula-flare': {
                titleGradient: 'from-orange-400 to-blue-700',
                accentButtonBg: 'bg-orange-600',
                accentButtonHoverBg: 'hover:bg-orange-700',
                accentButtonFocusRing: 'focus:ring-orange-500',
                accentBorder: 'border-orange-600',
                accentText: 'text-orange-300',
                logoColor: 'text-orange-400',
                searchBarBorder: 'border-blue-800',
                searchBarHoverBorder: 'hover:border-orange-500',
                messageTextColor: 'text-blue-200',
                modalAccentText: 'text-orange-400',
                modalButtonBg: 'bg-orange-700',
                modalButtonHoverBg: 'hover:bg-orange-600',
                modalButtonFocusRing: 'focus:ring-orange-500'
            },
            'deep-nebula': {
                titleGradient: 'from-blue-400 to-purple-700',
                accentButtonBg: 'bg-blue-600',
                accentButtonHoverBg: 'hover:bg-blue-700',
                accentButtonFocusRing: 'focus:ring-blue-500',
                accentBorder: 'border-blue-600',
                accentText: 'text-blue-300',
                logoColor: 'text-blue-400',
                searchBarBorder: 'border-purple-800',
                searchBarHoverBorder: 'hover:border-blue-500',
                messageTextColor: 'text-purple-200',
                modalAccentText: 'text-blue-400',
                modalButtonBg: 'bg-blue-700',
                modalButtonHoverBg: 'hover:bg-blue-600',
                modalButtonFocusRing: 'focus:ring-blue-500'
            },
            'crimson-cosmos': {
                titleGradient: 'from-red-400 to-yellow-600',
                accentButtonBg: 'bg-red-700',
                accentButtonHoverBg: 'hover:bg-red-800',
                accentButtonFocusRing: 'focus:ring-red-500',
                accentBorder: 'border-red-600',
                accentText: 'text-red-300',
                logoColor: 'text-red-400',
                searchBarBorder: 'border-yellow-800',
                searchBarHoverBorder: 'hover:border-red-500',
                messageTextColor: 'text-yellow-200',
                modalAccentText: 'text-red-400',
                modalButtonBg: 'bg-red-700',
                modalButtonHoverBg: 'hover:bg-red-600',
                modalButtonFocusRing: 'focus:ring-red-500'
            }
        };

        // --- Global State Variables ---
        let searchText = '';
        let message = '';
        const placeholders = [
            "Ask Anything...",
            "Ask about the cosmos...",
            "Explore data insights...",
            "Discover new trends...",
            "Query the universe...",
            "Find cosmic truths...",
        ];
        let currentPlaceholder = '';
        let placeholderIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingInterval; // To store setInterval ID for typing effect
        let showSettingsModal = false;
        let showHistoryModal = false; // State for history modal visibility
        let isMainContentMinimized = false; // State for main content minimization

        // Settings options
        let currentThemeName = 'nebula-flare';
        let typingSpeedPreference = 150; // Default typing speed
        let isFloatingTitleEnabled = true;
        let aiVerbosity = 'standard';
        let isTelemetryEnabled = false; // Default to false
        let isSearchHistorySaved = true; // Default to true
        let isStarfieldEnabled = true; // default: enabled

        // Remove local searchHistory array, use userSearchHistory from main.js
        // let searchHistory = []; // REMOVE THIS LINE

        // --- DOM Elements ---
        const cosmicAITitle = document.getElementById('cosmicAITitle');
        const searchInput = document.getElementById('searchInput');
        const messageDisplay = document.getElementById('messageDisplay');
        const newChatButton = document.getElementById('newChatButton');
        const settingsButton = document.getElementById('settingsButton');
        const toggleViewButton = document.getElementById('toggleViewButton'); // Toggle View Button
        const exitButton = document.getElementById('exitButton');
        const settingsModal = document.getElementById('settingsModal');
        const settingsModalContent = document.getElementById('settingsModalContent');
        const closeSettingsModalButton = document.getElementById('closeSettingsModal');
        const themeSelect = document.getElementById('theme-select');
        const aiVerbositySelect = document.getElementById('ai-verbosity');
        const typingSpeedRange = document.getElementById('typing-speed');
        const currentSpeedSpan = document.getElementById('currentSpeed');
        const floatingTitleToggle = document.getElementById('floating-title-toggle');
        const telemetryToggle = document.getElementById('telemetry-toggle');
        const historyToggle = document.getElementById('history-toggle');
        const logoElement = document.getElementById('logo');
        const searchBarElement = document.getElementById('searchBar');
        const micButton = document.getElementById('micButton');
        const mainContent = document.getElementById('mainContent'); // Reference to main content
        const historyModal = document.getElementById('historyModal');
        const historyModalContent = document.getElementById('historyModalContent');
        const closeHistoryModalButton = document.getElementById('closeHistoryModal');
        const historyList = document.getElementById('historyList');
        const noHistoryMessage = document.getElementById('noHistoryMessage');
        const sidebar = document.getElementById('sidebar');
        const sidebarHistoryList = document.getElementById('sidebarHistoryList');


        // --- Functions to Update UI ---

        // Applies the selected theme's colors to various elements
        function applyTheme() {
            const activeTheme = themeConfigs[currentThemeName];

            // Defensive: check if elements exist before using them
            if (cosmicAITitle)
                cosmicAITitle.className = cosmicAITitle.className.replace(/from-[a-z]+-[0-9]+ to-[a-z]+-[0-9]+/g, activeTheme.titleGradient);

            if (newChatButton)
                newChatButton.className = newChatButton.className.replace(/bg-[a-z]+-[0-9]+ hover:bg-[a-z]+-[0-9]+.*focus:ring-[a-z]+-[0-9]+/g, `${activeTheme.accentButtonBg} ${activeTheme.accentButtonHoverBg} rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${activeTheme.accentButtonFocusRing} focus:ring-opacity-75`);

            if (settingsButton)
                settingsButton.className = settingsButton.className.replace(/focus:ring-[a-z]+-[0-9]+/g, `${activeTheme.modalButtonFocusRing}`);

            if (toggleViewButton)
                toggleViewButton.className = toggleViewButton.className.replace(/focus:ring-[a-z]+-[0-9]+/g, `focus:ring-${activeTheme.modalButtonFocusRing.split('-')[1]}`); // Adjust for non-accent button


            if (micButton)
                micButton.className = micButton.className.replace(/bg-[a-z]+-[0-9]+ hover:bg-[a-z]+-[0-9]+/g, `${activeTheme.accentButtonBg} ${activeTheme.accentButtonHoverBg}`);


            if (logoElement)
                logoElement.className = logoElement.className.replace(/text-[a-z]+-[0-9]+/g, activeTheme.logoColor);

            if (searchBarElement)
                searchBarElement.className = searchBarElement.className.replace(/border-[a-z]+-[0-9]+ hover:border-[a-z]+-[0-9]+/g, `border ${activeTheme.searchBarBorder} ${activeTheme.searchBarHoverBorder}`);

            if (messageDisplay)
                messageDisplay.className = messageDisplay.className.replace(/text-[a-z]+-[0-9]+/g, activeTheme.messageTextColor);

            if (settingsModal && settingsModal.querySelector('h2'))
                settingsModal.querySelector('h2').className = settingsModal.querySelector('h2').className.replace(/text-[a-z]+-[0-9]+/g, activeTheme.modalAccentText);

            if (historyModal && historyModal.querySelector('h2'))
                historyModal.querySelector('h2').className = historyModal.querySelector('h2').className.replace(/text-[a-z]+-[0-9]+/g, activeTheme.modalAccentText);

            // Update elements within the modal for dynamic styling
            const modalSelects = document.querySelectorAll('#settingsModal select'); // Select only within settings modal
            modalSelects.forEach(select => {
                select.className = select.className.replace(/focus:ring-[a-z]+-[0-9]+/g, activeTheme.modalButtonFocusRing);
            });

            const modalButtons = document.querySelectorAll('#settingsModal button:not(#closeSettingsModal)'); // Select only within settings modal
            modalButtons.forEach(button => {
                button.className = button.className.replace(/bg-[a-z]+-[0-9]+ hover:bg-[a-z]+-[0-9]+.*focus:ring-[a-z]+-[0-9]+/g, `${activeTheme.modalButtonBg} ${activeTheme.modalButtonHoverBg} text-white py-2 px-4 rounded-lg mt-3 transition-colors duration-200 focus:outline-none focus:ring-2 ${activeTheme.modalButtonFocusRing} transform hover:scale-105 active:scale-95`);
            });

            // Update custom styles for range slider and checkboxes
            updateCustomElementStyles();
        }

        // Updates the custom CSS variables for elements
        function updateCustomElementStyles() {
            const activeTheme = themeConfigs[currentThemeName];
            const accentColorHex = activeTheme.accentButtonBg.replace('bg-', '#');
            const focusRingColor = activeTheme.accentButtonFocusRing.replace('focus:ring-', '').replace('500', '400'); // Assuming a color like blue-500
            const focusRingHex = TailwindColors[focusRingColor]; // Map to actual hex if needed, or define in themeConfigs

            // Update range slider styles
            typingSpeedRange.style.setProperty('--slider-track-bg', `linear-gradient(to right, ${accentColorHex} ${((typingSpeedPreference - 50) / 250) * 100}%, #4b5563 ${((typingSpeedPreference - 50) / 250) * 100}%)`);
            typingSpeedRange.style.setProperty('--slider-thumb-bg', accentColorHex);
            typingSpeedRange.style.setProperty('--focus-ring', focusRingHex || `#${focusRingColor}`); // Fallback if not found

            // Update checkbox styles
            const checkboxes = document.querySelectorAll('.custom-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.style.setProperty('--checkbox-border', '#4b5563'); // gray-600
                checkbox.style.setProperty('--checkbox-bg', '#374151'); // gray-700
                checkbox.style.setProperty('--checkbox-checked-bg', accentColorHex);
                checkbox.style.setProperty('--focus-ring', focusRingHex || `#${focusRingColor}`);
            });
        }


        // --- Typewriter placeholder effect with blinking cursor ---
        let typewriterActive = false;
        let typewriterTimeout = null;
        let typewriterBlinkTimeout = null;
        let typewriterPaused = false;
        let typewriterPlaceholderIdx = 0;
        let typewriterCharIdx = 0;
        let typewriterIsDeleting = false;
        let typewriterCurrentText = '';
        let typewriterBlinkState = true;

        function startTypewriterEffect() {
            stopTypewriterEffect();
            typewriterActive = true;
            typewriterPlaceholderIdx = 0;
            typewriterCharIdx = 0;
            typewriterIsDeleting = false;
            typewriterCurrentText = '';
            typewriterBlinkState = true;
            type();
            blinkCursor();
            function type() {
                if (!typewriterActive) return;
                const fullText = placeholders[typewriterPlaceholderIdx];
                if (!typewriterIsDeleting) {
                    if (typewriterCharIdx < fullText.length) {
                        typewriterCharIdx++;
                        typewriterCurrentText = fullText.substring(0, typewriterCharIdx);
                    } else {
                        typewriterPaused = true;
                        typewriterTimeout = setTimeout(() => {
                            typewriterIsDeleting = true;
                            typewriterPaused = false;
                            type();
                        }, 1200);
                        return;
                    }
                } else {
                    if (typewriterCharIdx > 0) {
                        typewriterCharIdx--;
                        typewriterCurrentText = fullText.substring(0, typewriterCharIdx);
                    } else {
                        typewriterPaused = true;
                        typewriterTimeout = setTimeout(() => {
                            typewriterIsDeleting = false;
                            typewriterPlaceholderIdx = (typewriterPlaceholderIdx + 1) % placeholders.length;
                            typewriterPaused = false;
                            type();
                        }, 500);
                        return;
                    }
                }
                if (!searchInput.value && document.activeElement !== searchInput) {
                    searchInput.setAttribute('placeholder', typewriterCurrentText + (typewriterBlinkState ? '|' : ' '));
                }
                typewriterTimeout = setTimeout(type, 55 + Math.random() * 40);
            }
            function blinkCursor() {
                if (!typewriterActive) return;
                typewriterBlinkState = !typewriterBlinkState;
                if (!searchInput.value && document.activeElement !== searchInput) {
                    searchInput.setAttribute('placeholder', typewriterCurrentText + (typewriterBlinkState ? '|' : ' '));
                }
                typewriterBlinkTimeout = setTimeout(blinkCursor, 500);
            }
        }
        function stopTypewriterEffect() {
            typewriterActive = false;
            clearTimeout(typewriterTimeout);
            clearTimeout(typewriterBlinkTimeout);
        }

        // Always keep typewriter running unless user is typing
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (searchInput.value) {
                    stopTypewriterEffect();
                    searchInput.setAttribute('placeholder', '');
                } else if (document.activeElement !== searchInput) {
                    startTypewriterEffect();
                }
            });
            searchInput.addEventListener('focus', () => {
                stopTypewriterEffect();
                searchInput.setAttribute('placeholder', '');
            });
            searchInput.addEventListener('blur', () => {
                if (!searchInput.value) {
                    startTypewriterEffect();
                }
            });
        }

        // --- Sidebar history rendering (Gemini-style) ---
        function renderSidebarHistory() {
            if (!sidebarHistoryList) return;
            sidebarHistoryList.innerHTML = '';
            // Only show when sidebar is expanded and user is logged in and there is history
            const isExpanded = !sidebar.classList.contains('collapsed');
            const historyArr = (typeof window.userSearchHistory !== "undefined" && window.userSearchHistory.length)
                ? window.userSearchHistory
                : [];
            if (isExpanded && historyArr.length) {
                historyArr.slice().reverse().forEach((query, idx) => {
                    // Shorten query to 24 letters + …
                    let shortQuery = query.trim();
                    if (shortQuery.length > 24) {
                        shortQuery = shortQuery.slice(0, 24) + '...';
                    }
                    const item = document.createElement('div');
                    item.className = 'sidebar-history-item p-2 mb-2 bg-gray-800 rounded text-gray-200 text-sm truncate cursor-pointer hover:bg-gray-700 transition flex items-center justify-between';
                    item.title = query;
                    item.textContent = shortQuery;
                    item.addEventListener('click', () => {
                        if (searchInput) {
                            searchInput.value = query;
                            searchInput.focus();
                            stopTypewriterEffect();
                            searchInput.setAttribute('placeholder', '');
                        }
                    });
                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
                    removeBtn.className = 'ml-2 p-1 rounded hover:bg-gray-700 transition';
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const realIdx = historyArr.length - 1 - idx;
                        window.userSearchHistory.splice(realIdx, 1);
                        if (typeof saveUserSearchHistory === "function") saveUserSearchHistory();
                        setTimeout(renderSidebarHistory, 0);
                    });
                    item.appendChild(removeBtn);
                    sidebarHistoryList.appendChild(item);
                });
                sidebarHistoryList.style.display = 'block';
            } else {
                sidebarHistoryList.style.display = 'none';
            }
        }
        window.renderSidebarHistory = renderSidebarHistory;

        // Sidebar expand/collapse logic
        if (toggleViewButton && sidebar) {
            toggleViewButton.addEventListener('click', () => {
                const isCollapsed = sidebar.classList.toggle('collapsed');
                sidebar.setAttribute('data-collapsed', isCollapsed ? "true" : "false");
                setTimeout(renderSidebarHistory, 0);

                // Align hamburger to left when expanded, center when collapsed
                if (!isCollapsed) {
                    toggleViewButton.style.alignSelf = "flex-start";
                } else {
                    toggleViewButton.style.alignSelf = "center";
                }
            });

            // On load, ensure correct alignment
            if (!sidebar.classList.contains('collapsed')) {
                toggleViewButton.style.alignSelf = "flex-start";
            } else {
                toggleViewButton.style.alignSelf = "center";
            }
        }

        // --- Fix: Ensure toggleFloatingTitle is defined ---
        if (typeof toggleFloatingTitle !== "function") {
            function toggleFloatingTitle() {}
        }

        // --- Fix: Ensure renderSidebarHistory is defined ---
        if (typeof renderSidebarHistory !== "function") {
            function renderSidebarHistory() {}
        }

        // --- Fix: Ensure toggleMainContentMinimization is defined ---
        if (typeof toggleMainContentMinimization !== "function") {
            function toggleMainContentMinimization() {}
        }


        // --- Typewriter effect for AI replies ---
        /**
         * Typewriter effect for a message element.
         * @param {HTMLElement} el - The element to type into.
         * @param {string} text - The text to type.
         * @param {number} [delay=35] - Delay in ms per character.
         * @returns {Promise<void>}
         */
        function typewriter(el, text, delay = 35) {
            return new Promise(resolve => {
                el.innerHTML = "";
                let i = 0;
                function type() {
                    if (i < text.length) {
                        el.innerHTML += text[i] === "\n" ? "<br>" : text[i];
                        i++;
                        setTimeout(type, delay);
                    } else {
                        resolve();
                    }
                }
                type();
            });
        }

        function hideCosmicAITitle() {
            if (cosmicAITitle) {
                cosmicAITitle.style.display = "none";
            }
        }

        // In your chatForm submit handler, after the first message is sent and the form is docked, hide the title:
        chatForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const msg = searchInput.value.trim();
            if (!msg) return;

            // Move chat form to bottom after first submit
            if (!window.chatFormDocked) {
                chatForm.classList.add("fixed", "bottom-0", "left-1/2", "-translate-x-1/2", "px-4", "pb-6", "z-20");
                window.chatFormDocked = true;
                hideCosmicAITitle(); // Hide the animated title after first message
            }

            // ...existing code...
        });

        // --- Initial Setup ---
        document.addEventListener('DOMContentLoaded', () => {
            startTypewriterEffect();
            toggleFloatingTitle();
            applyTheme();
            if (telemetryToggle) telemetryToggle.checked = isTelemetryEnabled;
            if (historyToggle) historyToggle.checked = isSearchHistorySaved;
            toggleMainContentMinimization();
            setTimeout(renderSidebarHistory, 0);
        });

        // Search Input Enter key press
        if (searchInput && chatForm) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Let the form submit event handle the logic, do not show any custom message here
                    // Optionally, you can trigger form submission manually:
                    chatForm.requestSubmit && chatForm.requestSubmit();
                }
            });
        }

        // Settings Button click
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                showSettingsModal = true;
                showHistoryModal = false; // Close other modals
                updateSettingsModalVisibility();
                updateHistoryModalVisibility();
                // Ensure values in modal reflect current state
                if (themeSelect) themeSelect.value = currentThemeName;
                if (aiVerbositySelect) aiVerbositySelect.value = aiVerbosity;
                if (typingSpeedRange) typingSpeedRange.value = typingSpeedPreference;
                if (currentSpeedSpan) currentSpeedSpan.textContent = `Current Speed: ${typingSpeedPreference}ms/char (Lower is Faster)`;
                if (floatingTitleToggle) floatingTitleToggle.checked = isFloatingTitleEnabled;
                if (telemetryToggle) telemetryToggle.checked = isTelemetryEnabled;
                if (historyToggle) historyToggle.checked = isSearchHistorySaved;
                applyTheme(); // Re-apply theme to update modal specific colors
            });
        }

        // Close Settings Modal button click
        if (closeSettingsModalButton) {
            closeSettingsModalButton.addEventListener('click', () => {
                showSettingsModal = false;
                updateSettingsModalVisibility();
            });
        }

        // Close History Modal button click
        if (closeHistoryModalButton) {
            closeHistoryModalButton.addEventListener('click', () => {
                showHistoryModal = false;
                updateHistoryModalVisibility();
            });
        }

        // Theme selection change in settings modal
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                currentThemeName = e.target.value;
                applyTheme(); // Re-apply theme immediately
            });
        }

        // AI Verbosity selection change
        if (aiVerbositySelect) {
            aiVerbositySelect.addEventListener('change', (e) => {
                aiVerbosity = e.target.value;
            });
        }

        // Typing Speed range input change
        if (typingSpeedRange && currentSpeedSpan) {
            typingSpeedRange.addEventListener('input', (e) => {
                typingSpeedPreference = Number(e.target.value);
                currentSpeedSpan.textContent = `Current Speed: ${typingSpeedPreference}ms/char (Lower is Faster)`;
                updateCustomElementStyles(); // Update slider track color dynamically
                // Restart typing effect with new speed
                clearInterval(typingInterval);
                startTypewriterEffect();
            });
        }

        // Floating Title Toggle change
        if (floatingTitleToggle) {
            floatingTitleToggle.addEventListener('change', (e) => {
                isFloatingTitleEnabled = e.target.checked;
                toggleFloatingTitle();
            });
        }

        // Telemetry Toggle change
        if (telemetryToggle) {
            telemetryToggle.addEventListener('change', (e) => {
                isTelemetryEnabled = e.target.checked;
            });
        }

        // Search History Toggle change
        if (historyToggle) {
            historyToggle.addEventListener('change', (e) => {
                isSearchHistorySaved = e.target.checked;
                // Optionally clear history if user disables saving
            });
        }

        // Exit Button click
        if (exitButton) {
            exitButton.addEventListener('click', () => {
                window.close(); // Browser security might prevent this if not opened by script
            });
        }


        // --- Modal Visibility Logic with Animations ---
        function updateSettingsModalVisibility() {
            if (showSettingsModal) {
                settingsModal.classList.remove('hidden');
                setTimeout(() => {
                    settingsModal.classList.add('modal-overlay-enter-active');
                    settingsModalContent.classList.add('modal-content-enter-active');
                }, 10);
            } else {
                settingsModal.classList.remove('modal-overlay-enter-active');
                settingsModalContent.classList.remove('modal-content-enter-active');
                settingsModal.addEventListener('transitionend', function handler() {
                    if (!showSettingsModal) {
                        settingsModal.classList.add('hidden');
                    }
                    settingsModal.removeEventListener('transitionend', handler);
                }, { once: true }); // Use { once: true } to auto-remove listener
            }
        }

        function updateHistoryModalVisibility() {
            if (showHistoryModal) {
                historyModal.classList.remove('hidden');
                setTimeout(() => {
                    historyModal.classList.add('modal-overlay-enter-active');
                    historyModalContent.classList.add('modal-content-enter-active');
                }, 10);
            } else {
                historyModal.classList.remove('modal-overlay-enter-active');
                historyModalContent.classList.remove('modal-content-enter-active');
                historyModal.addEventListener('transitionend', function handler() {
                    if (!showHistoryModal) {
                        historyModal.classList.add('hidden');
                    }
                    historyModal.removeEventListener('transitionend', handler);
                }, { once: true });
            }
        }


        // --- Initial Setup ---
        document.addEventListener('DOMContentLoaded', () => {
            startTypewriterEffect();
            toggleFloatingTitle();
            applyTheme(); // Apply initial theme
            // Set initial checkbox states based on variables
            telemetryToggle.checked = isTelemetryEnabled;
            historyToggle.checked = isSearchHistorySaved;
            toggleMainContentMinimization(); // Apply initial minimization state (default maximized)
            setTimeout(renderSidebarHistory, 0);
        });

        // --- Keep typewriter running even after user input ---
        searchInput.addEventListener('input', () => {
            if (searchInput.value) {
                stopTypewriterEffect();
                searchInput.setAttribute('placeholder', '');
            } else if (document.activeElement !== searchInput) {
                startTypewriterEffect();
            }
        });
        searchInput.addEventListener('focus', () => {
            stopTypewriterEffect();
            searchInput.setAttribute('placeholder', '');
        });
        searchInput.addEventListener('blur', () => {
            if (!searchInput.value) {
                startTypewriterEffect();
            }
        });



        // --- Typewriter effect for AI replies ---
        /**
         * Typewriter effect for a message element.
         * @param {HTMLElement} el - The element to type into.
         * @param {string} text - The text to type.
         * @param {number} [delay=35] - Delay in ms per character.
         * @returns {Promise<void>}
         */
        function typewriter(el, text, delay = 35) {
            return new Promise(resolve => {
                el.innerHTML = "";
                let i = 0;
                function type() {
                    if (i < text.length) {
                        el.innerHTML += text[i] === "\n" ? "<br>" : text[i];
                        i++;
                        setTimeout(type, delay);
                    } else {
                        resolve();
                    }
                }
                type();
            });
        }

        function hideCosmicAITitle() {
            if (cosmicAITitle) {
                cosmicAITitle.style.display = "none";
            }
        }

        // In your chatForm submit handler, after the first message is sent and the form is docked, hide the title:
        chatForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const msg = searchInput.value.trim();
            if (!msg) return;

            // Move chat form to bottom after first submit
            if (!window.chatFormDocked) {
                chatForm.classList.add("fixed", "bottom-0", "left-1/2", "-translate-x-1/2", "px-4", "pb-6", "z-20");
                window.chatFormDocked = true;
                hideCosmicAITitle(); // Hide the animated title after first message
            }

            // ...existing code...
        });

        // --- Fix: Define TailwindColors used for dynamic CSS ---
        const TailwindColors = {
            'orange-400': '#fb923c',
            'orange-500': '#f97316',
            'blue-500': '#3b82f6',
            'blue-700': '#1d4ed8',
            'purple-800': '#6d28d9',
            'red-500': '#ef4444',
            'yellow-800': '#a16207',
            'gray-600': '#4b5563',
            'gray-700': '#374151',
            // Add more as needed
        };

        // --- User Profile Display in Sidebar ---
        function renderUserProfile() {
            if (!sidebar) return;
            // Remove existing profile if present
            let existingProfile = document.getElementById('sidebarUserProfile');
            if (existingProfile) existingProfile.remove();

            // Use global variables set in main.js
            const name = window.userDisplayName || '';
            const photo = window.userPhotoURL || '';

            if (name || photo) {
                const profileDiv = document.createElement('div');
                profileDiv.id = 'sidebarUserProfile';
                profileDiv.className = 'flex flex-col items-center mb-6 w-full';
                profileDiv.innerHTML = `
                    <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-accent mb-2 bg-gray-700 flex items-center justify-center">
                        ${photo ? `<img src="${photo}" alt="${name}" class="w-full h-full object-cover">` : `<span class="text-3xl">${name ? name[0].toUpperCase() : '?'}</span>`}
                    </div>
                    <div class="text-sm font-semibold text-gray-200 truncate w-full text-center">${name}</div>
                `;
                // Insert at the top of the sidebar (after hamburger/new chat)
                const topDiv = sidebar.querySelector('div.flex.flex-col.items-center.w-full');
                if (topDiv) {
                    topDiv.insertAdjacentElement('afterend', profileDiv);
                } else {
                    sidebar.insertBefore(profileDiv, sidebar.firstChild);
                }
            }
        }

        // Listen for user info changes (main.js sets these on login)
        window.renderUserProfile = renderUserProfile;

        // Optionally, observe changes to userDisplayName/userPhotoURL and re-render
        const userProfileObserver = new MutationObserver(() => renderUserProfile());
        userProfileObserver.observe(document.body, { childList: true, subtree: true });

        // Call on DOMContentLoaded and after login
        document.addEventListener('DOMContentLoaded', () => {
            // ...existing code...
            renderUserProfile();
        });

        // --- Starfield Animation ---
        // Only show starfield in the main area, not under the sidebar
        function startStarfield() {
            const mainContent = document.getElementById('mainContent');
            if (!mainContent) return;
            // Remove any existing starfield
            let existing = mainContent.querySelector('.stars-bg');
            if (existing) return;

            const container = document.createElement('div');
            container.className = 'stars-bg';
            container.style.position = 'absolute';
            container.style.top = 0;
            container.style.left = 0;
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = 0;
            mainContent.style.position = 'relative';
            mainContent.insertBefore(container, mainContent.firstChild);

            const canvas = document.createElement('canvas');
            container.appendChild(canvas);
            let w = mainContent.offsetWidth, h = mainContent.offsetHeight;
            canvas.width = w;
            canvas.height = h;

            let ctx = canvas.getContext('2d');
            let numStars = Math.floor((w * h) / 1800);
            let stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.1 + 0.2,
                    speed: Math.random() * 0.12 + 0.03,
                    alpha: Math.random() * 0.5 + 0.5
                });
            }
            let running = true;
            function animate() {
                if (!running) return;
                ctx.clearRect(0, 0, w, h);
                for (let s of stars) {
                    ctx.globalAlpha = s.alpha;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
                    ctx.fillStyle = "#fff";
                    ctx.fill();
                    s.x += s.speed;
                    if (s.x > w) s.x = 0;
                }
                ctx.globalAlpha = 1;
                requestAnimationFrame(animate);
            }
            animate();

            // Responsive
            function resize() {
                w = mainContent.offsetWidth;
                h = mainContent.offsetHeight;
                canvas.width = w;
                canvas.height = h;
                numStars = Math.floor((w * h) / 1800);
                if (stars.length < numStars) {
                    for (let i = stars.length; i < numStars; i++) {
                        stars.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            r: Math.random() * 1.1 + 0.2,
                            speed: Math.random() * 0.12 + 0.03,
                            alpha: Math.random() * 0.5 + 0.5
                        });
                    }
                } else if (stars.length > numStars) {
                    stars.length = numStars;
                }
            }
            window.addEventListener('resize', resize);

            // Store cleanup for stopStarfield
            container._starfieldCleanup = function() {
                running = false;
                window.removeEventListener('resize', resize);
                container.remove();
            };
        }

        function stopStarfield() {
            const mainContent = document.getElementById('mainContent');
            if (!mainContent) return;
            let container = mainContent.querySelector('.stars-bg');
            if (container && container._starfieldCleanup) {
                container._starfieldCleanup();
            }
        }

        // --- Starfield toggle logic ---
        function updateStarfield() {
            if (isStarfieldEnabled) {
                startStarfield();
            } else {
                stopStarfield();
            }
        }

        // --- Add toggle to settings modal ---
        document.addEventListener('DOMContentLoaded', () => {
            // ...existing code...

            // Add toggle to settings modal if not present
            let starfieldToggle = document.getElementById('starfield-toggle');
            if (!starfieldToggle) {
                // Find a good place in the settings modal (after floating title toggle)
                const animDiv = document.querySelector('#settingsModal .p-4.bg-gray-800.rounded-lg.border');
                if (animDiv) {
                    const wrapper = document.createElement('div');
                    wrapper.className = "flex items-center mt-4";
                    wrapper.innerHTML = `
                        <label for="starfield-toggle" class="text-gray-400 mr-3">Animated Starfield Background:</label>
                        <input type="checkbox" id="starfield-toggle" class="custom-checkbox" ${isStarfieldEnabled ? "checked" : ""}>
                    `;
                    animDiv.appendChild(wrapper);
                }
            }
            // Listen for toggle changes
            starfieldToggle = document.getElementById('starfield-toggle');
            if (starfieldToggle) {
                starfieldToggle.checked = isStarfieldEnabled;
                starfieldToggle.addEventListener('change', (e) => {
                    isStarfieldEnabled = e.target.checked;
                    updateStarfield();
                });
            }

            // Start starfield if enabled
            updateStarfield();
        });

        // Also update starfield when settings modal is opened (to sync toggle)
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                const starfieldToggle = document.getElementById('starfield-toggle');
                if (starfieldToggle) starfieldToggle.checked = isStarfieldEnabled;
            });
        }
          
